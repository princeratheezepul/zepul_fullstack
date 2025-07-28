import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Recruiter from "../models/recruiter.model.js";
import { Job } from "../models/job.model.js";
import nodemailer from "nodemailer";
import { User } from '../models/user.model.js';
import { Admin } from "../models/admin.model.js";
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "your_secret_key_here";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendWelcomeRecruiterEmail = async (toEmail, adminName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "You have been added as a Recruiter",
    html: `
      <p>Hello,</p>
      <p>You have been added as a recruiter by admin <strong>${adminName}</strong>.</p>
      <p>Please login to your account using your credentials.</p>
    `,
  };
  console.log(mailOptions);
  await transporter.sendMail(mailOptions);
};
const sendWelcomeEmail = async (toEmail, managerName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "You have been added as a Recruiter",
    html: `
      <p>Hello,</p>
      <p>You have been added as a recruiter by manager <strong>${managerName}</strong>.</p>
      <p>Please login to your account using your credentials.</p>
    `,
  };
  console.log(mailOptions);
  await transporter.sendMail(mailOptions);
};

export const recruiterSignup = async (req, res) => {
  console.log(req.body);
  const { email, password, type, userId, adminId, username } = req.body;
  console.log(userId, adminId);

  try {
    const existing = await Recruiter.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Recruiter already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newRecruiter = await Recruiter.create({
      email,
      password: hashedPassword,
      username,
      type,
      userId: userId || null,
      adminId: adminId || null,
    });

    // Determine name of creator
    const creator = userId
      ? await User.findById(userId)
      : await Admin.findById(adminId);

    const creatorName = creator?.fullname || "your manager/admin";
    const admin = await Admin.findById(adminId);
    if (admin) await sendWelcomeRecruiterEmail(email, admin.fullname);
    const manager = User.findById(userId);
    if (manager) await sendWelcomeEmail(email, manager.fullname);

    res
      .status(201)
      .json({ message: "Recruiter created successfully", user: newRecruiter });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

export const recruiterSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find recruiter by email
    const user = await Recruiter.findOne({ email });
    if (!user) return res.status(404).json({ message: "Recruiter not found" });

    // Check if user is disabled
    if (user.status === 'disabled') {
        return res.status(403).json({ message: "You are disabled to get access" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        type: user.type,
        jobsclosed: user.jobsclosed, // assuming these exist on user
        avgTAT: user.avgTAT,
        qualityheatmap: user.qualityheatmap,
        redflags: user.redflags,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    console.log("Generated access token:", accessToken);
    console.log("Generated refresh token:", refreshToken);

    // Set cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    console.log('Setting cookies with options:', options);
    console.log('Access token:', accessToken);
    console.log('Refresh token:', refreshToken);

    // Set both cookie names for compatibility
    res.cookie("recruiterToken", accessToken, options);
    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);

    // Send response
    res.json({ 
      message: "Login successful", 
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("Signin failed:", err);
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
};

export const recruiterLogout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
    };

    return res.status(200)
      .clearCookie("recruiterToken", options)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        message: "Recruiter logged out successfully",
        success: true
      });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

export const refreshRecruiterToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const recruiter = await Recruiter.findById(decodedToken._id);

    if (!recruiter) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== recruiter?.refreshToken) {
      return res.status(401).json({ message: "Refresh token is expired or used" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: recruiter._id,
        email: recruiter.email,
        type: recruiter.type,
        jobsclosed: recruiter.jobsclosed,
        avgTAT: recruiter.avgTAT,
        qualityheatmap: recruiter.qualityheatmap,
        redflags: recruiter.redflags,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { _id: recruiter._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    // Update refresh token in database
    recruiter.refreshToken = newRefreshToken;
    await recruiter.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    return res.status(200)
      .cookie("recruiterToken", newAccessToken, options)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        status: 200,
        message: "Access token refreshed",
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
      });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Test authentication endpoint
export const testRecruiterAuth = async (req, res) => {
  try {
    console.log('Test auth - req.id:', req.id);
    console.log('Test auth - req.user:', req.user);
    console.log('Test auth - cookies:', req.cookies);
    
    if (!req.id || !req.user) {
      return res.status(401).json({ 
        message: "Not authenticated",
        hasId: !!req.id,
        hasUser: !!req.user,
        cookies: req.cookies
      });
    }
    
    res.status(200).json({ 
      message: "Authenticated successfully",
      recruiterId: req.id,
      recruiter: req.user,
      cookies: req.cookies
    });
  } catch (error) {
    console.error('Test auth error:', error);
    res.status(500).json({ message: "Test auth failed", error: error.message });
  }
};

export const getRecruitersByCreator = async (req, res) => {
  try {
    const { creatorId, type } = req.query;
    console.log("req recived");
    console.log("hello", creatorId, type);
    if (!creatorId || !type) {
      return res
        .status(400)
        .json({ message: "Creator ID and type are required" });
    }
    console.log("hello");
    let recruiters;
    if (type === "manager") {
      // Check both userId and managerId for managers
      recruiters = await Recruiter.find({ 
        $or: [
          { userId: creatorId },
          { managerId: creatorId }
        ]
      });
    } else if (type === "admin") {
      recruiters = await Recruiter.find({ adminId: creatorId });
      // console.log(recruiters)
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
    console.log(recruiters);

    res.status(200).json({ recruiters });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching recruiters", error: err.message });
  }
};

export const getRecruiterById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findById(id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.status(200).json({ recruiter });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateRecruiterDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    const recruiter = await Recruiter.findByIdAndUpdate(id, updateFields, { new: true });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.status(200).json({ recruiter });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getRecruiterProfile = async (req, res) => {
  try {
    console.log('getRecruiterProfile - User from middleware:', req.user);
    console.log('getRecruiterProfile - User ID:', req.user._id);
    
    const recruiter = await Recruiter.findById(req.user._id)
      .populate('userId', 'fullname username')
      .populate('adminId', 'fullname username');
    
    console.log('getRecruiterProfile - Found recruiter:', !!recruiter);
    
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // Determine who onboarded the recruiter
    let onboardedBy = 'N/A';
    if (recruiter.userId) {
      onboardedBy = `Manager ${recruiter.userId.fullname || recruiter.userId.username}`;
    } else if (recruiter.adminId) {
      onboardedBy = `Admin ${recruiter.adminId.fullname || recruiter.adminId.username}`;
    }

    console.log('getRecruiterProfile - Onboarded by:', onboardedBy);

    // Format the response
    const profileData = {
      _id: recruiter._id,
      email: recruiter.email,
      username: recruiter.username,
      fullname: recruiter.fullname || '',
      DOB: recruiter.DOB ? recruiter.DOB.toISOString().split('T')[0] : '',
      gender: recruiter.gender || '',
      phone: recruiter.phone || '',
      type: recruiter.type,
      isActive: recruiter.isActive,
      onboardedBy: onboardedBy,
      createdAt: recruiter.createdAt,
      updatedAt: recruiter.updatedAt
    };

    console.log('getRecruiterProfile - Sending response:', profileData);

    res.json({ recruiter: profileData });
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.findByIdAndUpdate(
      req.params.id,
      { email: req.body.email, type: req.body.type },
      { new: true }
    );
    res.json({ recruiter });
  } catch (err) {
    res.status(500).json({ message: "Failed to update recruiter" });
  }
};

export const updateRecruiterProfile = async (req, res) => {
  try {
    const { fullname, DOB, gender, phone } = req.body;
    
    const updateData = {};
    if (fullname !== undefined) updateData.fullname = fullname;
    if (DOB !== undefined) updateData.DOB = DOB ? new Date(DOB) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (phone !== undefined) updateData.phone = phone;

    const recruiter = await Recruiter.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.json({ 
      message: "Profile updated successfully", 
      recruiter 
    });
  } catch (err) {
    console.error('Error updating recruiter profile:', err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};

export const toggleRecruiterStatus = async (req, res) => {
  try {
    console.log(req.body);
    const { isActive } = req.body;
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(req.params.id, {
      isActive,
    });
    res.json({ recruiter: updatedRecruiter });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const getAllRecruiters = async (req, res) => {
  try {
    // console.log("req recived")
    let recruiters;

    recruiters = await Recruiter.find();

    // console.log(recruiters);

    res.status(200).json({ recruiters });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching recruiters", error: err.message });
  }
};



export const forgotpassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const recruiter = await Recruiter.findOne({ email: email });
        if (!recruiter) {
            return res.status(404).json({ Status: "Recruiter not existed", message: "No account found with this email address" });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: recruiter._id }, "jwt_secret_key", { expiresIn: "1d" });
        
        // Save reset token and expiry to recruiter document
        recruiter.resetPasswordToken = resetToken;
        recruiter.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
        await recruiter.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `http://localhost:5173/recruiter/reset_password/${recruiter._id}/${resetToken}`;
        
        // Console log the URL for testing
        console.log('Password reset URL:', resetUrl);
        console.log('Sending reset email to:', recruiter.email);

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: recruiter.email,
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
};

export const resetpassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        // Find recruiter and verify token
        const recruiter = await Recruiter.findById(id);
        if (!recruiter) {
            return res.status(404).json({ Status: "Error", message: "Recruiter not found" });
        }

        // Check if reset token matches and is not expired
        if (recruiter.resetPasswordToken !== token) {
            return res.status(400).json({ Status: "Error", message: "Invalid reset token" });
        }

        if (recruiter.resetPasswordExpires < new Date()) {
            return res.status(400).json({ Status: "Error", message: "Reset token has expired" });
        }

        // Verify JWT token
        jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
            if (err) {
                return res.status(400).json({ Status: "Error", message: "Invalid or expired token" });
            }

            try {
                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 12);
                
                // Update the password and clear reset token fields
                await Recruiter.findByIdAndUpdate(
                    recruiter._id,
                    {
                        password: hashedPassword,
                        $unset: {
                            resetPasswordToken: 1,
                            resetPasswordExpires: 1
                        }
                    },
                    { runValidators: false }
                );

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
};

export const changeRecruiterPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });

    const isMatch = await bcrypt.compare(oldPassword, recruiter.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    recruiter.password = await bcrypt.hash(newPassword, 12);
    await recruiter.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update password" });
  }
};

export const validateSetPassword = async (req, res) => {
    const { id, token } = req.params;

    try {
        // Find user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ Status: "Error", message: "User not found" });
        }

        // Check if password is already set
        if (user.firstPassSet) {
            return res.status(400).json({ Status: "Error", message: "Password is already set" });
        }

        // Verify token
        if (user.resetPasswordToken !== token) {
            return res.status(400).json({ Status: "Error", message: "Invalid or expired token" });
        }

        // Check if token is expired
        if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ Status: "Error", message: "Token has expired" });
        }

        return res.json({ Status: "Success", message: "Token is valid" });
    } catch (error) {
        console.error('Validate set password error:', error);
        return res.status(500).json({ Status: "Error", message: "Internal server error" });
    }
};

export const setPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        // Find user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ Status: "Error", message: "User not found" });
        }

        // Check if password is already set
        if (user.firstPassSet) {
            return res.status(400).json({ Status: "Error", message: "Password is already set" });
        }

        // Verify token
        if (user.resetPasswordToken !== token) {
            return res.status(400).json({ Status: "Error", message: "Invalid or expired token" });
        }

        // Check if token is expired
        if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ Status: "Error", message: "Token has expired" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password and firstPassSet
        user.password = hashedPassword;
        user.firstPassSet = true;
        user.status = 'active'; // Activate user when they set password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Find and update recruiter password and status
        const recruiter = await Recruiter.findOne({ userId: user._id });
        if (recruiter) {
            recruiter.password = hashedPassword;
            recruiter.status = 'active'; // Activate recruiter when they set password
            await recruiter.save();
        }

        await user.save();
        
        return res.json({ Status: "Success", message: "Password set successfully" });
    } catch (error) {
        console.error('Set password error:', error);
        return res.status(500).json({ Status: "Error", message: "Internal server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createRecruiterByAdmin = async (req, res) => {
  try {
    const { fullname, email, password, dateOfBirth, gender, phone, onboardedBy, adminId } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email is already registered" });
    }

    // Check if recruiter with this email already exists
    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({ message: "Recruiter with this email is already registered" });
    }

    const username = fullname.replace(/\s+/g, '').toLowerCase();
    
    // Create user first
    const user = await User.create({
      username,
      fullname,
      email,
      password,
      type: 'recruiter',
      adminId,
      DOB: dateOfBirth,
      gender,
      phone,
      firstPassSet: false
    });

    // Create recruiter
    const recruiter = await Recruiter.create({
      email,
      password,
      username,
      fullname,
      DOB: dateOfBirth,
      gender,
      phone,
      type: 'recruiter',
      adminId,
      userId: user._id
    });

    // Generate reset token for password setting
    const resetToken = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "7d" });
    
    // Save reset token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save({ validateBeforeSave: false });

    // Create password set URL
    const setPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter/set_password/${user._id}/${resetToken}`;
    
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
      subject: 'Set Your Password - Account Created',
      html: `
        <h2>Welcome ${fullname}!</h2>
        <p>Your recruiter account has been created successfully.</p>
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
    const createdRecruiter = await Recruiter.findById(recruiter._id).select("-password");

    return res.status(201).json({
      status: 201,
      message: "Recruiter created successfully. Password set link has been sent to the email.",
      data: {
        user: createdUser,
        recruiter: createdRecruiter
      }
    });

  } catch (error) {
    console.error('Error creating recruiter:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createRecruiterByManager = async (req, res) => {
  try {
    const { fullname, email, password, dateOfBirth, gender, phone, onboardedBy, managerId } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email is already registered" });
    }

    // Check if recruiter with this email already exists
    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({ message: "Recruiter with this email is already registered" });
    }

    const username = fullname.replace(/\s+/g, '').toLowerCase();
    
    // Create user first
    const user = await User.create({
      username,
      fullname,
      email,
      password,
      type: 'recruiter',
      managerId, // Use managerId instead of adminId
      DOB: dateOfBirth,
      gender,
      phone,
      firstPassSet: false
    });

    // Create recruiter
    const recruiter = await Recruiter.create({
      email,
      password,
      username,
      fullname,
      DOB: dateOfBirth,
      gender,
      phone,
      type: 'recruiter',
      managerId, // Use managerId instead of adminId
      userId: user._id
    });

    // Generate reset token for password setting
    const resetToken = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "7d" });
    
    // Save reset token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save({ validateBeforeSave: false });

    // Create password set URL
    const setPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter/set_password/${user._id}/${resetToken}`;
    
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
      subject: 'Set Your Password - Recruiter Account Created',
      html: `
        <h2>Welcome ${fullname}!</h2>
        <p>Your recruiter account has been created successfully by manager <strong>${onboardedBy}</strong>.</p>
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
    const createdRecruiter = await Recruiter.findById(recruiter._id).select("-password");

    return res.status(201).json({
      status: 201,
      message: "Recruiter created successfully. Password set link has been sent to the email.",
      data: {
        user: createdUser,
        recruiter: createdRecruiter
      }
    });

  } catch (error) {
    console.error('Error creating recruiter:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the recruiter
    const recruiter = await Recruiter.findById(id);
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // Check if the current user is authorized to delete this recruiter
    // (Only the manager who created the recruiter or an admin can delete)
    const currentUser = req.user;
    const isAuthorized = 
      (currentUser.type === 'manager' && recruiter.managerId?.toString() === currentUser._id?.toString()) ||
      (currentUser.type === 'admin' && recruiter.adminId?.toString() === currentUser._id?.toString()) ||
      currentUser.type === 'admin'; // Admins can delete any recruiter

    if (!isAuthorized) {
      return res.status(403).json({ message: "You are not authorized to delete this recruiter" });
    }

    // Delete the associated user if it exists
    if (recruiter.userId) {
      await User.findByIdAndDelete(recruiter.userId);
    }

    // Delete the recruiter
    await Recruiter.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Recruiter deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting recruiter:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAssignedJobs = async (req, res) => {
  try {
    const recruiterId = req.id; // Get recruiter ID from JWT token (set by middleware)
    
    if (!recruiterId) {
      return res.status(400).json({ message: 'Recruiter ID is required.' });
    }

    // Find jobs where this recruiter is in the assignedRecruiters array
    const jobs = await Job.find({
      assignedRecruiters: recruiterId,
      isActive: true
    }).populate([
      { path: 'adminId', select: 'fullname username' },
      { path: 'managerId', select: 'fullname username' },
      { path: 'assignedRecruiters', select: 'fullname email status' },
      { path: 'companyId', select: 'name' }
    ]);

    return res.status(200).json({
      message: "Assigned jobs fetched successfully.",
      jobs,
      success: true
    });
  } catch (error) {
    console.error('Error fetching assigned jobs:', error);
    return res.status(500).json({
      message: "Error fetching assigned jobs.",
      success: false
    });
  }
};

// @desc Get recruiter performance stats
export const getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.id; // Get recruiter ID from JWT token (set by middleware)
    
    if (!recruiterId) {
      return res.status(400).json({ message: 'Recruiter ID is required.' });
    }

    // Find the recruiter and get their stats
    const recruiter = await Recruiter.findById(recruiterId).select('offersMade offersAccepted totalHires');
    
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found.' });
    }

    return res.status(200).json({
      message: "Recruiter stats fetched successfully.",
      stats: {
        offersMade: recruiter.offersMade || 0,
        offersAccepted: recruiter.offersAccepted || 0,
        totalHires: recruiter.totalHires || 0
      },
      success: true
    });
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);
    return res.status(500).json({
      message: "Error fetching recruiter stats.",
      success: false
    });
  }
};
