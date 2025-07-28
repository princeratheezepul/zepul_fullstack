import { Admin } from '../models/admin.model.js';
import jwt from 'jsonwebtoken';
import { Company } from '../models/company.model.js';
import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import Resume from '../models/resume.model.js';
import nodemailer from 'nodemailer';
import Recruiter from '../models/recruiter.model.js'
import { AccountManager } from '../models/accountmanager.model.js';
import bcrypt from 'bcryptjs';
import Scorecard from '../models/scorecard.model.js';
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const admin = await Admin.findById(userId);
        const accessToken = admin.generateAccessToken();
        const refreshToken =admin.generateRefreshToken();

       admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return { message: "Something went wrong" };
    }
}

const registerAdmin = async (req, res) => {
    try {
        // console.log("request received");
        // console.log(req.body); 
        const { fullname, email, password } = req.body;
        // console.log(req.body);
        const username = fullname.replace(/\s+/g, '').toLowerCase();
        // console.log(username, password);

        const existingUser = await Admin.findOne({ $or: [{ username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const user = await Admin.create({ username, fullname, email, password });
        const createdUser = await Admin.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            return res.status(500).json({ message: "Something went wrong" });
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

const loginAdmin= async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(req.body);
        // console.log(email, password);

        if (!(email)) {
            return res.status(400).json({ message: "Enter email" });
        }

        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please check the email." });
        }

        // Check if user is disabled
        if (user.status === 'disabled') {
            return res.status(403).json({ message: "You are disabled to get access" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password. Try again." });
        }
        // console.log("id", user._id);
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        // console.log("Generated Access Token: ", accessToken);
        // console.log("Generated Refresh Token: ", refreshToken);

        const loggedInUser = await Admin.findById(user._id).select("-password -refreshToken");

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

const logoutAdmin = async (req, res) => {
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

        const admin = await Admin.findById(decodedToken._id);

        if (!admin) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (incomingRefreshToken !== admin?.refreshToken) {
            return res.status(401).json({ message: "Refresh token is expired or used" });
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(admin._id);

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

export const getAdminInfo=async(req,res)=>{
    try {
        const adminId = req.params.adminId;
        console.log('Admin ID:', adminId);
    
        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
    
        const company = await Company.findOne({ adminId });
        const jobs = await Job.find({adminId });
        const recruiters = await Recruiter.find({ adminId });
        const users=await User.find({adminId});
    
        res.json({
          admin,
          company,
          jobs,
          recruiters,
          users
        });
      } catch (err) {
        console.error('Error in AdminInfo:', err);
        res.status(500).json({ error: 'Server error' });
      }
}


export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const adminId = req.user.id;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect old password' });

    admin.password = newPassword; // Let the pre-save hook handle hashing
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotpassword = async (req, res) => {
    const { email } = req.body;
    Admin.findOne({ email: email })
        .then(admin => {
            if (!admin) {
                return res.send({ Status: "Admin not existed" })
            }
            const token = jwt.sign({ id: admin._id }, "jwt_secret_key", { expiresIn: "1d" })
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });


            var mailOptions = {
                from: process.env.EMAIL_USER,
                to: admin.email,
                subject: 'Reset Password Link',
                text: `http://localhost:5173/admin/reset_password/${admin._id}/${token}`
            };
            console.log('Sending reset email to:', admin.email);
            console.log('Mail options:', mailOptions);

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    return res.send({ Status: "Success" })
                }
            });
        })
}


export const resetpassword = async (req, res) => {
    const { id, token } = req.params
    const { password } = req.body

    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if (err) {
            return res.json({ Status: "Error with token" })
        } else {
            bcrypt.hash(password, 10)
                .then(hash => {
                    Admin.findByIdAndUpdate({ _id: id }, { password: hash })
                        .then(u => res.send({ Status: "Success" }))
                        .catch(err => res.send({ Status: err }))
                })
                .catch(err => res.send({ Status: err }))
        }
    })
}



//my team controller

export const getManagerByAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    if (!adminId) {
      return res.status(400).json({ error: 'Admin ID is required' });
    }

    // console.log('Admin ID:', adminId);

    const managers = await User.find({ adminId });
    // console.log("Managers",managers)
    return res.status(200).json({ managers });
  } catch (err) {
    console.error('Error in getManagerByAdmin:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};






export const createCompany = async (req, res) => {
    // console.log(req.body);
    const { companytitle,description,location,industrysize,contact,website,adminId,managerId,note } = req.body;
    // console.log("adminId:", adminId);

    try {
        let job = await Company.findOne({ companytitle });
        if (job) {
            return res.status(400).json({
                message: "You can't register the same job.",
                success: false
            });
        }

        job = await Company.create({
            name:companytitle,
            description,
            location,
            industrysize,
            contact,
            website,
            adminId,
            //assining managerid and note to assignedTo array
            assignedTo: managerId ? [{ managerId, note }] : [],
        });
        if (managerId) {
            const manager = await User.findById(managerId);
            const admin = await Admin.findById(adminId);

            if (admin && manager) {
                await sendWelcomeEmail(manager.email, admin.username, job.companytitle);
            }
        }

        return res.status(201).json({
            message: "Company registered successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error registering the company.",
            success: false
        });
    }
};



export const getCompany = async (req, res) => {
    try {
        // console.log("received");
        const {adminId} = req.params;
        // console.log("adminId", adminId);
        if (!adminId) {
            return res.status(400).json({ message: 'Admin ID is required.' });
        }
        const companies = await Company.find({ adminId });
        // console.log("Companies",companies);
        return res.status(200).json({
            message: "Companies fetched successfully.",
            companies,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching companies.",
            success: false
        });
    }
};
        
export const assignedCompany = async (req, res) => {
    // Accepts: { managers: [{ managerId, note }] }
    const { managers } = req.body;
    const { companyId } = req.params;

    if (!Array.isArray(managers) || managers.length === 0) {
        return res.status(400).json({ message: "No managers provided", success: false });
    }

    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }
        const admin = await Admin.findById(company.adminId);
        let newlyAssigned = [];
        for (const { managerId, note } of managers) {
            // Add to assignedManagers if not already present
            if (!company.assignedManagers.some(id => id.toString() === managerId)) {
                company.assignedManagers.push(managerId);
                newlyAssigned.push({ managerId, note });
            }
            // Add to assignedTo if not already present
            if (!company.assignedTo.some(obj => obj.managerId.toString() === managerId)) {
                company.assignedTo.push({ managerId, note: note || "" });
            }
            // Add company to manager's assignedCompany
            const manager = await User.findById(managerId);
            if (manager && !manager.assignedCompany.some(cid => cid.toString() === companyId)) {
                manager.assignedCompany.push(companyId);
                await manager.save();
            }
        }
        company.isAssigned = company.assignedManagers.length > 0;
        await company.save();
        // Send emails to newly assigned managers
        for (const { managerId, note } of newlyAssigned) {
            const manager = await User.findById(managerId);
            if (manager && admin) {
                await sendAttractiveAssignmentEmail(manager.email, admin.fullname || admin.username, company.name, note);
            }
        }
        return res.status(200).json({
            message: "Managers assigned successfully",
            company,
            success: true
        });
    } catch (error) {
        console.error("assignedCompany error:", error);
        return res.status(500).json({
            message: "Error assigning managers",
            success: false
        });
    }
};
       

export const updatecompany = async (req, res) => {
  const { companyId } = req.params;
  const { industrysize } = req.body;
  console.log(companyId, industrysize);
  console.log("Industry size", industrysize);
  try {
    const company = await Company.findByIdAndUpdate(companyId, { industrysize }, { new: true });
    if (!company) {
      return res.status(404).json({ message: "Company not found", success: false });
    }
    return res.status(200).json({
      message: "Company updated successfully",
      company,
      success: true
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return res.status(500).json({
      message: "Error updating company",
      success: false
    });
  }
};

const sendWelcomeEmail = async (toEmail, adminName, companyName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'You have been added as a Manager',
      html: `
        <p>Hello,</p>
        <p>You have been added as a manager by admin <strong>${adminName}</strong> to the company <strong>${companyName}</strong>.</p>
        <p>Please login to your account using your credentials.</p>
      `,
    };

    console.log("Sending welcome email with options:", mailOptions);

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;  
  }
};


export const getRecruiterByAdmin=async(req,res)=>{
    try {
        // console.log(req.params.adminId)
        const recruiter = await Recruiter.find({ adminId: req.params.adminId });
        // console.log(recruiter)
        if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });
        res.json({ recruiter });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
}
export const getCompanyByAdmin=async(req,res)=>{
    try {
        // console.log("Requ")
        const company = await Company.find({ adminId: req.params.adminId });
        // console.log(company)
        if (!company) return res.status(404).json({ message: 'Company not found' });
        res.json({ company });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
}


export const createJobByAdmin = async (req, res) => {
  const {
    jobtitle,
    description,
    location,
    type,
    salary,
    openpositions,
    skills,
    experience,
    keyResponsibilities,
    preferredQualifications,
    companyId,
    adminId,
    recruiterId, // <-- this should be an array of recruiter/user IDs, e.g. ["6434abc...", "6434def..."]
  } = req.body;

  try {
    // Check if the job already exists for the company
    const existingJob = await Job.findOne({ jobtitle, companyId });
    if (existingJob) {
      return res.status(400).json({
        message: "A job with the same title already exists for this company.",
        success: false,
      });
    }

    // Create the job with all new fields
    const job = await Job.create({
      jobtitle,
      description,
      location,
      type,
      salary,
      openpositions,
      skills,
      experience,
      keyResponsibilities,
      preferredQualifications,
      companyId,
      adminId,
      assignedTo: recruiterId,
      isAssigned: recruiterId && recruiterId.length > 0 ? true : false,
    });

    // Map job to admin
    if (adminId) {
      await Admin.findByIdAndUpdate(adminId, { $push: { jobs: job._id } });
    }
    // Map job to each assigned user (recruiter)
    if (Array.isArray(recruiterId)) {
      await Promise.all(
        recruiterId.map(async (uid) => {
          await User.findByIdAndUpdate(uid, { $push: { jobs: job._id } });
        })
      );
    }

    return res.status(201).json({
      message: "Job registered successfully and recruiters assigned.",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      message: "Error registering the job.",
      success: false,
    });
  }
};


export const getJobsByAdmin=async(req,res)=>{
    try {
        const jobs = await Job.find({ adminId: req.params.adminId })
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username');
        // console.log(jobs);
        if (!jobs) return res.status(404).json({ message: 'Jobs not found' });
        res.json({ jobs });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
}


export const updatejobByAdmin = async (req, res) => {
  const jobId = req.params.id;
  console.log(jobId);

  const updateFields = req.body;

  try {
    const updatedJob = await Job.findByIdAndUpdate(jobId, updateFields, { new: true });

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    return res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob,
      success: true,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({
      message: "Error updating job",
      success: false
    });
  }
};

export const toggleJobStatusByAdmin = async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // Toggle the status (assuming you have an 'active' boolean field)
    job.isActive = !job.isActive;

    await job.save();

    res.status(200).json({
      message: `Job ${job.isActive ? "activated" : "deactivated"} successfully`,
      job,
      success: true,
    });
  } catch (error) {
    console.error("Error toggling job status:", error);
    res.status(500).json({ message: "Error updating job status", success: false });
  }
};

// Example (Express route)
export const deletejob= async (req, res) => {
    const { jobId } = req.params;
    try {
        await Job.findByIdAndDelete(jobId);
        res.json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting job" });
    }
};



export const assignRecruitersByAdmin=async(req,res)=>{
    const { recruiterId } = req.body;  
        const { jobId } = req.params;
    
        try {
            if (!recruiterId || typeof recruiterId !== 'string') {
                return res.status(400).json({ message: "Invalid recruiterId", success: false });
            }
    
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: "Job not found", success: false });
            }
    
            if (!Array.isArray(job.assignedTo)) job.assignedTo = [];
    
            if (!job.assignedTo.includes(recruiterId)) {
                job.assignedTo.push(recruiterId);
            }
    
            job.isAssigned = job.assignedTo.length > 0;
    
            await job.save();
            
            // Add job to recruiter's assignedJobs
            await Recruiter.findByIdAndUpdate(
                recruiterId,
                { $addToSet: { assignedJobs: jobId } }
            );
            
            console.log(recruiterId)
            const recruiter = await Recruiter.findById(recruiterId);
            const admin = await Admin.findById(job.adminId);
            console.log(recruiter,admin)
            if (recruiter && admin) {
                await sendWelcomeEmailToRecruiter(recruiter.email, admin.username, job.jobtitle);
            }
    
            return res.status(200).json({
                message: "Recruiter assigned successfully",
                job,
                success: true
            });
        } catch (error) {
            console.error("assignedJobm error:", error);
            return res.status(500).json({
                message: "Error assigning recruiter",
                success: false
            });
        }
}


const sendWelcomeEmailToRecruiter = async (toEmail, adminName, jobname) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(toEmail,adminName,jobname)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'You have been added as a Recruiter',
      html: `
        <p>Hello,</p>
        <p>You have been added as a recruiter by manager <strong>${adminName}</strong> to the job <strong>${jobname}</strong>.</p>
        <p>Please login to your account using your credentials.</p>
      `,
    };

    console.log("Sending welcome email with options:", mailOptions);

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;  
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

export const updateNote = async (req, res) => {
    try {
        const { candidateId, note } = req.body;
        const scorecard = await Scorecard.findOneAndUpdate(
            { candidateId },
            { note },
            { new: true }
        );
        res.json(scorecard);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get admin profile data
export const getAdminProfile = async (req, res) => {
    try {
        console.log('getAdminProfile called');
        console.log('req.user:', req.user);
        const adminId = req.user.id;
        console.log('adminId:', adminId);
        
        const admin = await Admin.findById(adminId).select('-password -refreshToken');
        console.log('admin found:', admin);
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'Admin profile retrieved successfully',
            data: admin
        });
    } catch (error) {
        console.error('Error in getAdminProfile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { fullname, dateOfBirth, gender, phone } = req.body;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update fields if provided
        if (fullname) admin.fullname = fullname;
        if (dateOfBirth) admin.dateOfBirth = new Date(dateOfBirth);
        if (gender) admin.gender = gender;
        if (phone) admin.phone = phone;

        await admin.save();

        const updatedAdmin = await Admin.findById(adminId).select('-password -refreshToken');

        res.status(200).json({
            status: 200,
            message: 'Admin profile updated successfully',
            data: updatedAdmin
        });
    } catch (error) {
        console.error('Error in updateAdminProfile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get user counts for admin dashboard with weekly changes from all schemas
export const getUserCounts = async (req, res) => {
    try {
        // Calculate date 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Models are already imported at the top

        // Get current counts from all schemas
        const [userManagerCount, userRecruiterCount, userAccountManagerCount] = await Promise.all([
            User.countDocuments({ type: 'manager' }),
            User.countDocuments({ type: 'recruiter' }),
            User.countDocuments({ type: 'accountmanager' })
        ]);

        // Get counts from Recruiter model (avoid duplicates)
        const recruiterModelCount = await Recruiter.countDocuments({
            email: { $nin: await User.distinct('email', { type: 'recruiter' }) }
        });

        // Get counts from AccountManager model (avoid duplicates)
        const accountManagerModelCount = await AccountManager.countDocuments({
            email: { $nin: await User.distinct('email', { type: 'accountmanager' }) }
        });

        // Calculate total counts
        const managerCount = userManagerCount;
        const recruiterCount = userRecruiterCount + recruiterModelCount;
        const accountManagerCount = userAccountManagerCount + accountManagerModelCount;

        // Get counts from 7 days ago
        const [userManagerCountLastWeek, userRecruiterCountLastWeek, userAccountManagerCountLastWeek] = await Promise.all([
            User.countDocuments({ type: 'manager', createdAt: { $lt: oneWeekAgo } }),
            User.countDocuments({ type: 'recruiter', createdAt: { $lt: oneWeekAgo } }),
            User.countDocuments({ type: 'accountmanager', createdAt: { $lt: oneWeekAgo } })
        ]);

        // Get counts from other models from 7 days ago
        const recruiterModelCountLastWeek = await Recruiter.countDocuments({
            email: { $nin: await User.distinct('email', { type: 'recruiter' }) },
            createdAt: { $lt: oneWeekAgo }
        });

        const accountManagerModelCountLastWeek = await AccountManager.countDocuments({
            email: { $nin: await User.distinct('email', { type: 'accountmanager' }) },
            createdAt: { $lt: oneWeekAgo }
        });

        // Calculate total counts from last week
        const managerCountLastWeek = userManagerCountLastWeek;
        const recruiterCountLastWeek = userRecruiterCountLastWeek + recruiterModelCountLastWeek;
        const accountManagerCountLastWeek = userAccountManagerCountLastWeek + accountManagerModelCountLastWeek;

        // Calculate changes
        const managerChange = managerCount - managerCountLastWeek;
        const recruiterChange = recruiterCount - recruiterCountLastWeek;
        const accountManagerChange = accountManagerCount - accountManagerCountLastWeek;

        // Calculate total users and total change
        const totalUsers = managerCount + recruiterCount + accountManagerCount;
        const totalUsersLastWeek = managerCountLastWeek + recruiterCountLastWeek + accountManagerCountLastWeek;
        const totalChange = totalUsers - totalUsersLastWeek;

        // Calculate percentage changes
        const calculatePercentageChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const managerPercentageChange = calculatePercentageChange(managerCount, managerCountLastWeek);
        const recruiterPercentageChange = calculatePercentageChange(recruiterCount, recruiterCountLastWeek);
        const accountManagerPercentageChange = calculatePercentageChange(accountManagerCount, accountManagerCountLastWeek);
        const totalPercentageChange = calculatePercentageChange(totalUsers, totalUsersLastWeek);

        res.status(200).json({
            status: 200,
            data: {
                managers: managerCount,
                recruiters: recruiterCount,
                accountManagers: accountManagerCount,
                total: totalUsers,
                changes: {
                    managers: {
                        count: managerChange,
                        percentage: managerPercentageChange
                    },
                    recruiters: {
                        count: recruiterChange,
                        percentage: recruiterPercentageChange
                    },
                    accountManagers: {
                        count: accountManagerChange,
                        percentage: accountManagerPercentageChange
                    },
                    total: {
                        count: totalChange,
                        percentage: totalPercentageChange
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error getting user counts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get paginated list of all users from all schemas
export const getUsersByAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Models are already imported at the top

        // Fetch users from all schemas
        const [userUsers, recruiterUsers, accountManagerUsers] = await Promise.all([
            // Users from User model (managers, account managers, and some recruiters)
            User.find({})
            .select('-password -refreshToken')
                .sort({ createdAt: -1 }),
            
            // Users from Recruiter model (primary recruiter data)
            Recruiter.find({})
                .select('-password')
                .sort({ createdAt: -1 }),
            
            // Users from AccountManager model (legacy account managers)
            AccountManager.find({})
                .select('-password -refreshToken')
                .sort({ createdAt: -1 })
        ]);

        // Combine and normalize all users
        let allUsers = [];

        // Add users from User model
        userUsers.forEach(user => {
            allUsers.push({
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                type: user.type,
                status: user.status,
                username: user.username,
                createdAt: user.createdAt,
                source: 'User'
            });
        });

        // Add users from Recruiter model (avoid duplicates with User model)
        recruiterUsers.forEach(recruiter => {
            // Check if this recruiter already exists in User model
            const existingUser = userUsers.find(u => u.email === recruiter.email);
            if (!existingUser) {
                allUsers.push({
                    _id: recruiter._id,
                    fullname: recruiter.fullname,
                    email: recruiter.email,
                    type: recruiter.type || 'recruiter',
                    status: recruiter.status,
                    username: recruiter.username,
                    createdAt: recruiter.createdAt,
                    source: 'Recruiter'
                });
            }
        });

        // Add users from AccountManager model (avoid duplicates with User model)
        accountManagerUsers.forEach(accountManager => {
            // Check if this account manager already exists in User model
            const existingUser = userUsers.find(u => u.email === accountManager.email);
            if (!existingUser) {
                allUsers.push({
                    _id: accountManager._id,
                    fullname: accountManager.fullname,
                    email: accountManager.email,
                    type: 'accountmanager',
                    status: accountManager.status,
                    username: accountManager.username,
                    createdAt: accountManager.createdAt,
                    source: 'AccountManager'
                });
            }
        });

        // Sort all users by creation date (latest first)
        allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply pagination
        const totalUsers = allUsers.length;
        const totalPages = Math.ceil(totalUsers / limit);
        const paginatedUsers = allUsers.slice(skip, skip + limit);

        res.status(200).json({
            status: 200,
            data: {
                users: paginatedUsers,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete user by admin
export const deleteUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { source } = req.body; // 'User', 'Recruiter', or 'AccountManager'

        let deletedUser = null;

        // Delete based on source
        switch (source) {
            case 'User':
                deletedUser = await User.findByIdAndDelete(userId);
                break;
            case 'Recruiter':
                // Also delete associated user if exists
                const recruiter = await Recruiter.findById(userId);
                if (recruiter && recruiter.userId) {
                    await User.findByIdAndDelete(recruiter.userId);
                }
                deletedUser = await Recruiter.findByIdAndDelete(userId);
                break;
            case 'AccountManager':
                deletedUser = await AccountManager.findByIdAndDelete(userId);
                break;
            default:
                return res.status(400).json({ message: 'Invalid source specified' });
        }

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'User deleted successfully',
            data: { deletedUser }
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Toggle user status by admin
export const toggleUserStatusByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { source, newStatus } = req.body; // 'User', 'Recruiter', or 'AccountManager'

        if (!['active', 'disabled'].includes(newStatus)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        let updatedUser = null;

        // Update based on source
        switch (source) {
            case 'User':
                updatedUser = await User.findByIdAndUpdate(
                    userId,
                    { status: newStatus },
                    { new: true, select: '-password -refreshToken' }
                );
                break;
            case 'Recruiter':
                updatedUser = await Recruiter.findByIdAndUpdate(
                    userId,
                    { status: newStatus },
                    { new: true, select: '-password' }
                );
                // Also update associated user if exists
                if (updatedUser && updatedUser.userId) {
                    await User.findByIdAndUpdate(
                        updatedUser.userId,
                        { status: newStatus }
                    );
                }
                break;
            case 'AccountManager':
                updatedUser = await AccountManager.findByIdAndUpdate(
                    userId,
                    { status: newStatus },
                    { new: true, select: '-password -refreshToken' }
                );
                break;
            default:
                return res.status(400).json({ message: 'Invalid source specified' });
        }

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const actionText = newStatus === 'active' ? 'activated' : 'disabled';

        res.status(200).json({
            status: 200,
            message: `User ${actionText} successfully`,
            data: { updatedUser }
        });

    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get all jobs for admin dashboard
export const getJobsByAdminForDashboard = async (req, res) => {
    try {
        const adminId = req.params.adminId;
        console.log("adminId", adminId);
        if (!adminId) {
            return res.status(400).json({ message: 'Admin ID is required.' });
        }

        // Fetch ALL jobs from the database, not just admin-created ones
        const jobs = await Job.find({})
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username')
            .populate('assignedRecruiters', 'fullname email status');
        console.log(jobs);
        return res.status(200).json({
            message: "All jobs fetched successfully.",
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

// Update job by admin (new function for admin dashboard)
export const updateJobByAdminForDashboard = async (req, res) => {
    try {
        const { jobId } = req.params;
        const updateData = req.body;

        const job = await Job.findByIdAndUpdate(
            jobId,
            updateData,
            { new: true, runValidators: true }
        ).populate('adminId', 'fullname username')
         .populate('managerId', 'fullname username')
         .populate('assignedRecruiters', 'fullname email status');

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job updated successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error updating job.",
            success: false
        });
    }
};

// Get job by ID for admin (new function for admin dashboard)
export const getJobByIdForAdminDashboard = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId)
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username')
            .populate('assignedRecruiters', 'fullname email status');

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Calculate real-time statistics from resume data
        const totalApplications = await Resume.countDocuments({ jobId });
        const shortlistedCount = await Resume.countDocuments({ jobId, status: 'shortlisted' });
        const interviewedCount = await Resume.countDocuments({ jobId, status: 'scheduled' });
        const secondRoundCount = await Resume.countDocuments({ jobId, status: 'offered' });

        // Create job object with updated statistics
        const jobWithStats = {
            ...job.toObject(),
            totalApplication_number: totalApplications,
            shortlisted_number: shortlistedCount,
            interviewed_number: interviewedCount,
            "2ndround_interviewed_number": secondRoundCount
        };

        return res.status(200).json({
            message: "Job fetched successfully.",
            job: jobWithStats,
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

// Assign recruiters to job by admin (new function for admin dashboard)
export const assignRecruitersToJobByAdminDashboard = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { recruiterIds } = req.body;

        const job = await Job.findByIdAndUpdate(
            jobId,
            { assignedRecruiters: recruiterIds },
            { new: true, runValidators: true }
        ).populate('adminId', 'fullname username')
         .populate('managerId', 'fullname username')
         .populate('assignedRecruiters', 'fullname email status');

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Recruiters assigned successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error assigning recruiters.",
            success: false
        });
    }
};

// Get candidates for job by admin (new function for admin dashboard)
export const getCandidatesForJobByAdminDashboard = async (req, res) => {
    try {
        const { jobId } = req.params;

        // This would need to be implemented based on your candidate model
        // For now, returning empty array
        const candidates = [];

        return res.status(200).json({
            message: "Candidates fetched successfully.",
            candidates,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching candidates.",
            success: false
        });
    }
};

// Get resumes by job for admin
export const getResumesByJobForAdmin = async (req, res) => {
    try {
        const { jobId } = req.params;

        const resumes = await Resume.find({ jobId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Resumes fetched successfully.",
            resumes,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching resumes.",
            success: false
        });
    }
};

// Update resume status by admin
export const updateResumeStatusByAdmin = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { status } = req.body;

        const resume = await Resume.findByIdAndUpdate(
            resumeId,
            { status },
            { new: true, runValidators: true }
        );

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Resume status updated successfully.",
            resume,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error updating resume status.",
            success: false
        });
    }
};

// Update resume note by admin
export const updateResumeNoteByAdmin = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { note } = req.body;

        const resume = await Resume.findByIdAndUpdate(
            resumeId,
            { addedNotes: note },
            { new: true, runValidators: true }
        );

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Resume note updated successfully.",
            resume,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error updating resume note.",
            success: false
        });
    }
};

// Get job statistics for admin
export const getJobStatisticsForAdmin = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Calculate real-time statistics from resume data
        const totalApplications = await Resume.countDocuments({ jobId });
        const shortlistedCount = await Resume.countDocuments({ jobId, status: 'shortlisted' });
        const interviewedCount = await Resume.countDocuments({ jobId, status: 'scheduled' });
        const secondRoundCount = await Resume.countDocuments({ jobId, status: 'offered' });

        const statistics = {
            totalApplication_number: totalApplications,
            shortlisted_number: shortlistedCount,
            interviewed_number: interviewedCount,
            "2ndround_interviewed_number": secondRoundCount
        };

        return res.status(200).json({
            message: "Job statistics fetched successfully.",
            statistics,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching job statistics.",
            success: false
        });
    }
};

export {registerAdmin, loginAdmin, logoutAdmin, generateAccessAndRefreshToken, refreshAccessToken};

// Attractive email for manager assignment
const sendAttractiveAssignmentEmail = async (toEmail, adminName, companyName, note) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `You have been assigned to ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e0e7ef;">
          <div style="background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%); color: #fff; padding: 24px 32px;">
            <h2 style="margin: 0; font-size: 2rem;">🎉 Assignment Notification</h2>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 1.1rem; color: #1e293b;">Hello,</p>
            <p style="font-size: 1.1rem; color: #1e293b;">You have been <b>assigned</b> as a manager by <b>${adminName}</b> to the company <b>${companyName}</b>.</p>
            ${note ? `<div style="margin: 24px 0; padding: 18px; background: #e0e7ef; border-radius: 8px; color: #334155;"><b>Special Note:</b><br/>${note}</div>` : ''}
            <p style="font-size: 1.1rem; color: #1e293b;">Please login to your account to view your new assignment.</p>
            <div style="margin-top: 32px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #2563eb; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">Go to Dashboard</a>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending attractive assignment email:", error);
    throw error;
  }
};

export const removeManagerFromCompany = async (req, res) => {
    const { managerId } = req.body;
    const { companyId } = req.params;

    if (!managerId) {
        return res.status(400).json({ message: "Manager ID is required", success: false });
    }

    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        // Remove manager from assignedManagers array
        company.assignedManagers = company.assignedManagers.filter(
            id => id.toString() !== managerId
        );

        // Remove manager from assignedTo array
        company.assignedTo = company.assignedTo.filter(
            obj => obj.managerId.toString() !== managerId
        );

        // Update isAssigned flag
        company.isAssigned = company.assignedManagers.length > 0;

        await company.save();

        // Remove company from manager's assignedCompany array
        const manager = await User.findById(managerId);
        if (manager) {
            manager.assignedCompany = manager.assignedCompany.filter(
                cid => cid.toString() !== companyId
            );
            await manager.save();
        }

        return res.status(200).json({
            message: "Manager removed successfully",
            company,
            success: true
        });
    } catch (error) {
        console.error("removeManagerFromCompany error:", error);
        return res.status(500).json({
            message: "Error removing manager",
            success: false
        });
    }
};