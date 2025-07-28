import { AccountManager as AccountManagerModel } from '../models/accountmanager.model.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import {Company} from "../models/company.model.js"
import { Job } from '../models/job.model.js';
import Scorecard from '../models/scorecard.model.js'
import Resume from '../models/resume.model.js'
import { Admin } from '../models/admin.model.js';
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // Try to find user in User collection first
        let user = await User.findById(userId);
        
        if (!user) {
            // If not found in User collection, check AccountManagerModel
            user = await AccountManagerModel.findById(userId);
        }
        
        if (!user) {
            throw new Error("User not found");
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return { message: "Something went wrong" };
    }
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendWelcomeEmail = async (toEmail, adminName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'You have been added as a Account Manager',
    html: `
      <p>Hello,</p>
      <p>You have been added as a Account Manager by admin <strong>${adminName}</strong>.</p>
      <p>Please login to your account using your credentials.</p>
    `,
  };
  console.log(mailOptions)
  await transporter.sendMail(mailOptions);
};

const registerAccountManager = async (req, res) => {
  try {
    console.log("request received");
    const { fullname, email, password, adminId } = req.body;
    const username = fullname.replace(/\s+/g, '').toLowerCase();

    // Check if username already exists
    const existingUser = await AccountManagerModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create the user data object to save
    const newUserData = { username, fullname, email, password, type: 'accountmanager' };
    if (adminId) {
      newUserData.adminId = adminId; // add reference if adminId exists
    }

    // Create user
    const user = await AccountManagerModel.create(newUserData);

    // Remove sensitive data from response
    const createdUser = await AccountManagerModel.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    const admin = await Admin.findById(adminId);
    // Send welcome email if adminId exists (means invited or registered by admin)
    if (adminId && admin) {
      try {
        await sendWelcomeEmail(email, admin.fullname)
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // We do NOT fail the registration if email sending fails
      }
    }

    return res.status(201).json({
      status: 201,
      message: "User created successfully",
      data: createdUser
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const   loginAccountManager = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Enter email" });
        }

        // Look for user in User collection first (for admin-created account managers)
        let user = await User.findOne({ email, type: 'accountmanager' });
        
        if (!user) {
            // If not found in User collection, check AccountManagerModel (for legacy users)
            user = await AccountManagerModel.findOne({ email, type: 'accountmanager' });
        }
        
        if (!user) {
            return res.status(404).json({ message: "User not found. Please check the email." });
        }

        // Check if user is disabled
        if (user.status === 'disabled') {
            return res.status(403).json({ message: "You are disabled to get access" });
        }

        // Check if password is set (for admin-created users)
        if (user.firstPassSet === false) {
            return res.status(400).json({ message: "Please set your password first using the link sent to your email." });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password. Try again." });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken") || 
                           await AccountManagerModel.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
        };

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                status: 200,
                message: "User logged in successfully",
                data: { user: loggedInUser, accessToken, refreshToken }
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const logoutAccountManager = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(400).json({ message: "No token found, please log in again." });
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
        };

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                status: 200,
                message: "User logged out successfully",
                data: {}
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Try to find user in User collection first
        let user = await User.findById(decodedToken._id);
        
        if (!user) {
            // If not found in User collection, check AccountManagerModel
            user = await AccountManagerModel.findById(decodedToken._id);
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({ message: "Refresh token is expired or used" });
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                status: 200,
                message: "Access token refreshed",
                data: { accessToken, refreshToken: newRefreshToken }
            });
    } catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
}



export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Try to find user in User collection first
    let user = await User.findById(userId);
    
    if (!user) {
      // If not found in User collection, check AccountManagerModel
      user = await AccountManagerModel.findById(userId);
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect old password' });

    user.password = newPassword; // Let the pre-save hook handle hashing
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotpassword = async (req, res) => {
    const { email } = req.body;
    try {
        // 1. Check User collection for account manager
        let user = await User.findOne({ email: email, type: 'accountmanager' });
        let isLegacy = false;
        if (!user) {
            // 2. If not found, check AccountManager collection (legacy)
            user = await AccountManagerModel.findOne({ email: email });
            isLegacy = true;
        }
        if (!user) {
            return res.status(404).json({ Status: "User not existed", message: "No account found with this email address" });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1d" });

        // Save reset token and expiry to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `http://localhost:5173/accountmanager/reset_password/${user._id}/${resetToken}`;

        // Console log the URL for testing
        console.log('Password reset URL:', resetUrl);
        console.log('Sending reset email to:', user.email);

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset Password Link',
            text: `Click the following link to reset your password: ${resetUrl}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Email error:', error);
                return res.status(500).json({ Status: "Error", message: "Failed to send email" });
            } else {
                return res.json({ Status: "Success", message: "Password reset email sent successfully" });
            }
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ Status: "Error", message: "Internal server error" });
    }
}


export const resetpassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        // Try User collection first
        let user = await User.findById(id);
        let isLegacy = false;
        if (!user) {
            // If not found, try AccountManager collection
            user = await AccountManagerModel.findById(id);
            isLegacy = true;
        }
        if (!user) {
            return res.status(404).json({ Status: "Error", message: "User not found" });
        }

        // Check if reset token matches and is not expired
        if (user.resetPasswordToken !== token) {
            return res.status(400).json({ Status: "Error", message: "Invalid reset token" });
        }

        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ Status: "Error", message: "Reset token has expired" });
        }

        // Verify JWT token
        jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
            if (err) {
                return res.status(400).json({ Status: "Error", message: "Invalid or expired token" });
            }

            try {
                // First clear the reset token fields
                if (isLegacy) {
                    await AccountManagerModel.findByIdAndUpdate(
                        user._id,
                        {
                            $unset: {
                                resetPasswordToken: 1,
                                resetPasswordExpires: 1
                            }
                        },
                        { runValidators: false }
                    );
                } else {
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                }

                // Then update the password using save to trigger the pre-save hook
                user.password = password;
                await user.save({ validateBeforeSave: false });

                return res.json({ Status: "Success", message: "Password reset successfully" });
            } catch (updateError) {
                console.error('Password update error:', updateError);
                return res.status(500).json({ Status: "Error", message: "Failed to update password" });
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ Status: "Error", message: "Internal server error" });
    }
}

export const getAccountManagerInfo=async(req,res)=>{
    try {
        const accountmanagerId = req.params.accountmanagerId;
        console.log('AccountManager ID:', accountmanagerId);
    
        // Try to find user in User collection first
        let user = await User.findById(accountmanagerId);
        
        if (!user) {
            // If not found in User collection, check AccountManagerModel
            user = await AccountManagerModel.findById(accountmanagerId);
        }
        
        if (!user) return res.status(404).json({ error: 'User not found' });
    
        res.json({
            user
        });
      } catch (err) {
        console.error('Error in AccountManagerInfo:', err);
        res.status(500).json({ error: 'Server error' });
      }
}
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username')
            .populate('accountManagerId', 'fullname username');
        // console.log(jobs);
        return res.status(200).json({
            message: "Jobs fetched successfully.",
            jobs,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching jobs.",
            success: false
        });
    }
};

export const getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId)
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username')
            .populate('accountManagerId', 'fullname username');
        
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }
        
        return res.status(200).json({
            message: "Job fetched successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching job.",
            success: false
        });
    }
};

export const getUniqueCandidates= async (req, res) => {
  try {
    const allScorecards = await Scorecard.find({});
    const uniqueMap = new Map();

    allScorecards.forEach((sc) => {
      const resumeId = sc.resume._id;
      if (!uniqueMap.has(resumeId)) {
        uniqueMap.set(resumeId, {
          resumeId,
          candidateId: sc.candidateId,
          name: sc.resume.name,
          email: sc.resume.email_address,
          location: sc.resume.location,
        });
      }
    });

    res.json(Array.from(uniqueMap.values()));
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
}

export const getDetailsCandidate=async (req, res) => {
  try {
    const { resumeId } = req.params;
    const scorecard = await Scorecard.find({ "resume._id": resumeId });
    if (!scorecard) return res.status(404).json({ error: "Not found" });
    // console.log(scorecard);
    res.json({
    //   resume: scorecard.resume,
    //   answers: scorecard.answers || [],
      scorecard,
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
}

export const getCandidatesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Find all scorecards for this job
    const scorecards = await Scorecard.find({ jobId: jobId })
      .populate('resume')
      .populate('candidateId');
    
    if (!scorecards) {
      return res.status(404).json({ error: "No candidates found for this job" });
    }
    
    // Transform the data to match the expected format
    const candidates = scorecards.map(scorecard => ({
      _id: scorecard._id,
      fullname: scorecard.resume?.name || scorecard.candidateId?.fullname || 'Unknown',
      email: scorecard.resume?.email_address || scorecard.candidateId?.email || 'No email',
      location: scorecard.resume?.location || 'No location',
      appliedAt: scorecard.createdAt,
      status: scorecard.status || 'applied',
      coverLetter: scorecard.resume?.coverLetter || '',
      overallScore: scorecard.overallScore || 0
    }));
    
    res.json({
      candidates: candidates,
      success: true
    });
  } catch (err) {
    console.error('Error fetching candidates by job:', err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getResumesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('AccountManager getResumesByJob - jobId:', jobId);
    
    // First try to find scorecards for this job
    let scorecards = await Scorecard.find({ "jobId": jobId })
      .populate('resume')
      .populate('candidateId');
    
    console.log('Found scorecards:', scorecards.length);
    
    // If no scorecards found, try to find resumes for this job
    if (!scorecards || scorecards.length === 0) {
      console.log('No scorecards found, checking Resume model...');
      
      const resumes = await Resume.find({ "jobId": jobId });
      console.log('Found resumes:', resumes.length);
      
      if (resumes && resumes.length > 0) {
        // Transform resumes to match scorecard format
        scorecards = resumes.map(resume => ({
          _id: resume._id,
          resume: resume, // Put the resume data in the resume field
          candidateId: null,
          status: resume.status || 'submitted',
          addedNotes: resume.addedNotes || '',
          createdAt: resume.createdAt,
          jobId: resume.jobId
        }));
      }
    }
    
    if (!scorecards || scorecards.length === 0) {
      console.log('No data found for job:', jobId);
      return res.status(404).json({ error: "No resumes found for this job" });
    }
    
    console.log('Returning scorecards:', scorecards.length);
    res.json(scorecards);
  } catch (err) {
    console.error('Error fetching resumes by job:', err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const updateResumeStatus = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { status, addedNotes } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (addedNotes !== undefined) updateData.addedNotes = addedNotes;
    
    console.log('Updating resume/scorecard:', resumeId, updateData);
    
    // First try to update in Scorecard model
    let scorecard = await Scorecard.findByIdAndUpdate(
      resumeId,
      updateData,
      { new: true }
    );
    
    // If not found in Scorecard, try Resume model
    if (!scorecard) {
      console.log('Not found in Scorecard, trying Resume model...');
      scorecard = await Resume.findByIdAndUpdate(
        resumeId,
        updateData,
        { new: true }
      );
    }
    
    if (!scorecard) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    const message = status !== undefined && addedNotes !== undefined 
      ? "Status and note updated successfully" 
      : status !== undefined 
        ? "Status updated successfully" 
        : "Note updated successfully";
    
    res.json({ message, scorecard });
  } catch (err) {
    console.error('Error updating resume:', err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const updateAccountManagerInfo = async (req, res) => {
  try {
    const { accountmanagerId } = req.params;
    const allowedFields = [
      'fullname', 'email', 'DOB', 'gender', 'phone', 'address', 'department', 'profile'
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    // Try to update user in User collection first
    let updatedUser = await User.findByIdAndUpdate(
      accountmanagerId,
      { $set: updateData },
      { new: true, runValidators: true, select: '-password -refreshToken' }
    );
    
    if (!updatedUser) {
      // If not found in User collection, try AccountManagerModel
      updatedUser = await AccountManagerModel.findByIdAndUpdate(
        accountmanagerId,
        { $set: updateData },
        { new: true, runValidators: true, select: '-password -refreshToken' }
      );
    }
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: updatedUser, message: 'Account info updated successfully' });
  } catch (err) {
    console.error('Error updating AccountManager info:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createAccountManagerByAdmin = async (req, res) => {
  try {
    const { fullname, email, password, dateOfBirth, gender, phone, onboardedBy, adminId } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email is already registered" });
    }

    const username = fullname.replace(/\s+/g, '').toLowerCase();
    
    // Create user
    const user = await User.create({
      username,
      fullname,
      email,
      password,
      type: 'accountmanager',
      adminId,
      DOB: dateOfBirth,
      gender,
      phone,
      firstPassSet: false
    });

    // Generate reset token for password setting
    const resetToken = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "7d" });
    
    // Save reset token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save({ validateBeforeSave: false });

    // Create password set URL
    const setPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accountmanager/set_password/${user._id}/${resetToken}`;
    
    // Console log the URL for testing
    console.log('Password set URL:', setPasswordUrl);
    console.log('Sending password set email to:', email);

    // Send email with password set link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Set Your Password - Account Manager Account Created',
      html: `
        <h2>Welcome ${fullname}!</h2>
        <p>Your account manager account has been created successfully.</p>
        <p>Please click the link below to set your password:</p>
        <a href="${setPasswordUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Set Password</a>
        <p>This link will expire in 7 days.</p>
        <p>If you didn't request this account, please ignore this email.</p>
      `
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error:', error);
        // Don't fail the request if email fails, just log it
      } else {
        console.log('Password set email sent successfully');
      }
    });

    // Remove sensitive data from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json({
      status: 201,
      message: "Account Manager created successfully. Password set link has been sent to the email.",
      data: createdUser
    });

  } catch (error) {
    console.error('Error creating account manager:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const validateSetPassword = async (req, res) => {
  const { id, token } = req.params;

  try {
    // Find user
    let user = await User.findById(id);
    let isLegacy = false;
    if (!user) {
      user = await AccountManagerModel.findById(id);
      isLegacy = true;
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if reset token matches and is not expired
    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Verify JWT token
    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      return res.json({
        firstPassSet: user.firstPassSet,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          type: user.type
        }
      });
    });

  } catch (error) {
    console.error('Error validating set password:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const setPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Try User collection first
    let user = await User.findById(id);
    let isLegacy = false;
    if (!user) {
      user = await AccountManagerModel.findById(id);
      isLegacy = true;
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check firstPassSet (only for User model)
    if (!isLegacy && user.firstPassSet) {
      return res.status(400).json({ message: "You have already set the password" });
    }

    // Check if reset token matches and is not expired
    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Verify JWT token
    jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      try {
        // Update password and set firstPassSet to true (only for User model)
        user.password = password;
        if (!isLegacy) {
          user.firstPassSet = true;
          user.status = 'active'; // Activate user when they set password
        }
        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        return res.json({ message: "Password set successfully" });
      } catch (updateError) {
        console.error('Password update error:', updateError);
        return res.status(500).json({ message: "Failed to update password" });
      }
    });

  } catch (error) {
    console.error('Error setting password:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export {registerAccountManager,loginAccountManager,logoutAccountManager,generateAccessAndRefreshToken,refreshAccessToken};