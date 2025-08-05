import Resume from "../models/resume.model.js";
import {Admin} from "../models/admin.model.js";
import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import Recruiter from "../models/recruiter.model.js";
import nodemailer from "nodemailer";
import { determineResumeTag } from "../utils/tagHelper.js";
// @desc Save parsed resume to DB with jobId
export const saveResumeWithJob = async (req, res) => {
  try {
    console.log("Received request to save resume with jobId:", req.params.jobId);
    console.log("Resume data:", req.body);
    console.log("User ID:", req.id);
    console.log("User role:", req.role);
    
    const resumeData = req.body;
    const { jobId } = req.params;
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware

    if (!jobId) {
      return res.status(400).json({ message: "JobId is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate if jobId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId format" });
    }

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Fetch job details to determine tag
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Determine tag based on job title and description
    const tag = determineResumeTag(job.jobtitle, job.description);

    // Create resume object based on user role
    const resumeObject = {
      jobId,
      tag,
      ...resumeData,
    };

    // Add the appropriate ID field based on user role
    if (userRole === 'manager') {
      resumeObject.managerId = userId;
    } else {
      // For recruiters, add recruiterId and also fetch their managerId
      resumeObject.recruiterId = userId;
      
      // Fetch recruiter details to get their managerId
      try {
        const recruiter = await Recruiter.findById(userId);
        if (recruiter && recruiter.managerId) {
          resumeObject.managerId = recruiter.managerId;
          console.log("Added managerId from recruiter:", recruiter.managerId);
        } else {
          console.log("No managerId found for recruiter:", userId);
        }
      } catch (error) {
        console.error("Error fetching recruiter details:", error);
        // Continue without managerId if there's an error
      }
    }

    const newResume = new Resume(resumeObject);

    console.log("Creating new resume document:", newResume);
    const saved = await newResume.save();
    console.log("Resume saved successfully:", saved._id);

    // Increment totalApplication_number for the job
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplication_number: 1 } });
    
    res.status(201).json({ message: "Resume saved successfully", resume: saved });
  } catch (err) {
    console.error("Error saving resume:", err);
    res.status(500).json({ message: "Failed to save resume", error: err.message });
  }
};

// @desc Save parsed resume to DB
export const saveResume = async (req, res) => {
  try {
    const resumeData = req.body;
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // If no tag is provided in resumeData, default to Engineering
    const tag = resumeData.tag || 'Engineering';

    // Create resume object based on user role
    const resumeObject = {
      tag,
      ...resumeData,
    };

    // Add the appropriate ID field based on user role
    if (userRole === 'manager') {
      resumeObject.managerId = userId;
    } else {
      // For recruiters, add recruiterId and also fetch their managerId
      resumeObject.recruiterId = userId;
      
      // Fetch recruiter details to get their managerId
      try {
        const recruiter = await Recruiter.findById(userId);
        if (recruiter && recruiter.managerId) {
          resumeObject.managerId = recruiter.managerId;
          console.log("Added managerId from recruiter:", recruiter.managerId);
        } else {
          console.log("No managerId found for recruiter:", userId);
        }
      } catch (error) {
        console.error("Error fetching recruiter details:", error);
        // Continue without managerId if there's an error
      }
    }

    const newResume = new Resume(resumeObject);

    const saved = await newResume.save();
    res.status(201).json({ message: "Resume saved successfully", resume: saved });
  } catch (err) {
    console.error("Error saving resume:", err);
    res.status(500).json({ message: "Failed to save resume", error: err.message });
  }
};

// @desc Get resumes for a specific job
export const getResumesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware

    let query = { jobId };
    
    // If user is a manager, only show resumes they uploaded
    if (userRole === 'manager') {
      query.managerId = userId;
    }
    // If user is a recruiter, only show resumes they uploaded
    else if (userRole === 'recruiter') {
      query.recruiterId = userId;
    }
    // If no role specified, show all resumes for the job (for backward compatibility)

    const resumes = await Resume.find(query).populate('jobId');
    res.status(200).json(resumes);
  } catch (err) {
    console.error("Error fetching resumes for job:", err);
    res.status(500).json({ message: "Failed to retrieve resumes", error: err.message });
  }
};

// @desc Get resumes for a specific user
export const getUserResumes = async (req, res) => {
  try {
    const { userId } = req.params;
    const resumes = await Resume.find({ userId });
    res.status(200).json(resumes);
  } catch (err) {
    console.error("Error fetching resumes:", err);
    res.status(500).json({ message: "Failed to retrieve resumes", error: err.message });
  }
};

// @desc Get resumes uploaded by a specific user (recruiter or manager)
export const getResumesByRecruiter = async (req, res) => {
  try {
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware
    const recruiterId = req.params.recruiterId; // Get recruiter ID from URL params
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let query = {};
    
    // If recruiterId is provided in URL, use that specific recruiter
    if (recruiterId) {
      query.recruiterId = recruiterId;
    } else {
      // Build query based on user role
      if (userRole === 'manager') {
        query.managerId = userId;
      } else {
        query.recruiterId = userId;
      }
    }

    const resumes = await Resume.find(query).populate('jobId');
    
    // Return in the expected format for the frontend
    res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (err) {
    console.error("Error fetching resumes by user:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve resumes", 
      error: err.message 
    });
  }
};

export const searchResumesByJobRole = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) return res.status(400).json({ message: "Missing role query param" });

    const resumes = await Resume.find({
      $or: [
        { recommended_job_roles: { $regex: role, $options: "i" } },
        { suggested_resume_category: { $regex: role, $options: "i" } },
        { skills: { $elemMatch: { $regex: role, $options: "i" } } },
      ],
    });

    res.json(resumes);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ message: "Search error", error: err.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getResume = async (req, res) => {
  try {
    console.log("REcieved");
    const resumes = await Resume.find(); // Fetches all resumes from the collection
    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ message: "Server error while fetching resumes" });
  }
};

// @desc Get resumes by tag
export const getResumesByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const validTags = ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Finance'];
    
    if (!validTags.includes(tag)) {
      return res.status(400).json({ message: "Invalid tag. Must be one of: Engineering, Marketing, Sales, Customer Support, Finance" });
    }

    const resumes = await Resume.find({ tag }).populate('jobId');
    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching resumes by tag:", error);
    res.status(500).json({ message: "Server error while fetching resumes by tag" });
  }
};

// @desc Update resume tag
export const updateResumeTag = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { tag } = req.body;
    
    const validTags = ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Finance'];
    
    if (!validTags.includes(tag)) {
      return res.status(400).json({ message: "Invalid tag. Must be one of: Engineering, Marketing, Sales, Customer Support, Finance" });
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      { tag },
      { new: true }
    );

    if (!updatedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json({ message: "Tag updated successfully", resume: updatedResume });
  } catch (error) {
    console.error("Error updating resume tag:", error);
    res.status(500).json({ message: "Server error while updating resume tag" });
  }
};


const sendAnotherRoundEmail = async (toEmail, adminName,) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
    throw new Error(`Invalid recipient email: ${toEmail}`);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Request for another round of interview',
    html: `
      <p>Hello,</p>
      <p>You have been requested for another round of interview by admin <strong>${adminName}</strong> </strong>.</p>
      <p>Please login to your account using your credentials.</p>
    `,
  };
  console.log(mailOptions)
  await transporter.sendMail(mailOptions);
};

export const requestAnotherRound = async (req, res) => {
  const { resumeId, requestAnotherRound,userId } = req.body;
  console.log("req recieved")
  try {
    // Update the scorecard
    const updatedScorecard = await Resume.findByIdAndUpdate(
      resumeId,
      { requestAnotherRound },
      { new: true }
    );

    if (!updatedScorecard) {
      return res.status(404).json({ success: false, message: 'Scorecard not found' });
    }

    // Send email to candidate
    const toEmail = updatedScorecard.resume?.email;
    const admin=await Admin.findById(userId);


    if (toEmail) {
      await sendAnotherRoundEmail(toEmail, admin.fullname);
    }

    res.status(200).json({ success: true, message: 'Request updated and email sent.' });
  } catch (error) {
    console.error("Error requesting another round:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


export const submitToManager=async(req,res)=>{
  const { resumeId, isApproved, feedback } = req.body;
  try {
    await Resume.findByIdAndUpdate(resumeId, {
      isApproved,
      feedback,
      submittedAt: new Date(),
    });
    res.status(200).json({ message: 'Submitted to manager' });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
}

export const updateResumeStatus = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const recruiterId = req.id; // Get recruiter ID from JWT token
    
    console.log('PATCH /api/resumes/:resumeId called');
    console.log('resumeId:', resumeId);
    console.log('recruiterId:', recruiterId);
    console.log('req.body:', req.body);
    
    // If only addedNotes is present, only update that field
    if (
      Object.keys(req.body).length === 1 &&
      Object.prototype.hasOwnProperty.call(req.body, 'addedNotes')
    ) {
      const updatedResume = await Resume.findByIdAndUpdate(
        resumeId,
        { addedNotes: req.body.addedNotes },
        { new: true }
      );
      if (!updatedResume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      return res.status(200).json({ message: 'Note updated successfully', resume: updatedResume });
    }

    // Otherwise, handle status update as before
    const { status, referredToManager } = req.body;
    const validStatuses = ['scheduled', 'screening', 'submitted', 'shortlisted', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Build update object
    const updateObj = {};
    if (status) updateObj.status = status;
    if (typeof referredToManager === 'boolean') updateObj.referredToManager = referredToManager;
    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      updateObj,
      { new: true }
    );
    if (!updatedResume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // If status is being set to 'shortlisted', increment offersAccepted for the recruiter
    if (status === 'shortlisted' && updatedResume.recruiterId) {
      try {
        await Recruiter.findByIdAndUpdate(
          updatedResume.recruiterId,
          { $inc: { offersAccepted: 1 } }
        );
        console.log(`Incremented offersAccepted for recruiter ${updatedResume.recruiterId}`);
      } catch (recruiterError) {
        console.error('Error incrementing offersAccepted:', recruiterError);
        // Don't fail the main request if this fails
      }
    }
    
    // If referredToManager is being set to true, increment offersMade for the recruiter
    if (referredToManager === true && recruiterId) {
      try {
        await Recruiter.findByIdAndUpdate(
          recruiterId,
          { $inc: { offersMade: 1 } }
        );
        console.log(`Incremented offersMade for recruiter ${recruiterId}`);
      } catch (recruiterError) {
        console.error('Error incrementing offersMade:', recruiterError);
        // Don't fail the main request if this fails
      }
    }
    
    res.status(200).json({ message: 'Status updated successfully', resume: updatedResume });
  } catch (error) {
    console.error('Error updating resume status:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

const sendInterviewEmail = async (toEmail, candidateName, interviewDay, interviewDate, interviewTime) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
    throw new Error(`Invalid recipient email: ${toEmail}`);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Interview Scheduled - You have been selected!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Interview Scheduled</h2>
        <p>Dear ${candidateName},</p>
        <p>Congratulations! You have been selected for an interview.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Interview Details:</h3>
          <p><strong>Date:</strong> ${interviewDay}, ${interviewDate}</p>
          <p><strong>Time:</strong> ${interviewTime}</p>
        </div>
        <p>Please be prepared and join the interview at the scheduled time.</p>
        <p>Best regards,<br>Recruitment Team</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

// @desc Schedule interview and save questions
export const scheduleInterview = async (req, res) => {
  try {
    // const { resumeId } = req.params;
    // const { interviewDay, interviewDate, interviewTime, questions } = req.body;

    // // Validate required fields
    // if (!interviewDay || !interviewDate || !interviewTime || !questions) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }

    // // Find the resume
    // const resume = await Resume.findById(resumeId);
    // if (!resume) {
    //   return res.status(404).json({ message: "Resume not found" });
    // }

    // // Update resume with interview details
    // const updatedResume = await Resume.findByIdAndUpdate(
    //   resumeId,
    //   {
    //     interviewScheduled: true,
    //     interviewDay,
    //     interviewDate,
    //     interviewTime,
    //     interviewQuestions: questions,
    //     status: 'scheduled'
    //   },
    //   { new: true }
    // );

    // // Increment shortlisted_number for the job
    // await Job.findByIdAndUpdate(resume.jobId, { $inc: { shortlisted_number: 1 } });

    // // Send email to candidate
    // if (resume.email) {
    //   await sendInterviewEmail(
    //     resume.email,
    //     resume.name,
    //     interviewDay,
    //     interviewDate,
    //     interviewTime
    //   );
    // }

    // res.status(200).json({ 
    //   message: "Interview scheduled successfully", 
    //   resume: updatedResume 
    // });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Failed to schedule interview", error: error.message });
  }
};

// @desc Get resume statistics for a user (recruiter or manager)
export const getResumeStatsByRecruiter = async (req, res) => {
  try {
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log('getResumeStatsByRecruiter - User ID:', userId);
    console.log('getResumeStatsByRecruiter - User Role:', userRole);

    // Build query based on user role
    let matchQuery = {};
    
    if (userRole === 'manager') {
      // For managers: find resumes associated with jobs where managerId matches
      matchQuery = {
        $or: [
          { managerId: new mongoose.Types.ObjectId(userId) },
          { 
            jobId: { 
              $in: await Job.distinct('_id', { managerId: new mongoose.Types.ObjectId(userId) }) 
            } 
          }
        ]
      };
    } else {
      // For recruiters: find resumes associated with jobs where recruiter is assigned
      matchQuery = {
        $or: [
          { recruiterId: new mongoose.Types.ObjectId(userId) },
          { 
            jobId: { 
              $in: await Job.distinct('_id', { assignedRecruiters: new mongoose.Types.ObjectId(userId) }) 
            } 
          }
        ]
      };
    }

    console.log('getResumeStatsByRecruiter - Match Query:', JSON.stringify(matchQuery, null, 2));

    // Get total count of resumes for this user
    const totalResumes = await Resume.countDocuments(matchQuery);
    console.log('getResumeStatsByRecruiter - Total Resumes:', totalResumes);

    // Get breakdown by tag using aggregation
    const tagBreakdown = await Resume.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$tag", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('getResumeStatsByRecruiter - Tag Breakdown:', tagBreakdown);

    // Define all valid tags
    const validTags = ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Finance'];
    
    // Create a map of tag counts
    const tagCountMap = {};
    tagBreakdown.forEach(item => {
      tagCountMap[item._id] = item.count;
    });

    // Format the data to include all tags with 0 for missing ones
    const formattedData = validTags.map(tag => ({
      name: tag,
      value: tagCountMap[tag] || 0
    }));

    // Add "Other" category for unknown tags or null tags
    const otherCount = tagBreakdown
      .filter(item => !validTags.includes(item._id) || !item._id)
      .reduce((sum, item) => sum + item.count, 0);
    
    formattedData.push({
      name: 'Other',
      value: otherCount
    });

    console.log('getResumeStatsByRecruiter - Formatted Data:', formattedData);

    res.status(200).json({
      total: totalResumes,
      data: formattedData
    });
  } catch (err) {
    console.error("Error fetching resume statistics:", err);
    res.status(500).json({ message: "Failed to retrieve resume statistics", error: err.message });
  }
};

// @desc Get resume statistics for account manager dashboard
export const getResumeStatsForAccountManager = async (req, res) => {
  try {
    console.log('getResumeStatsForAccountManager called');

    // Get total count of all resumes in the database
    const totalResumes = await Resume.countDocuments({});
    console.log('Total resumes in database:', totalResumes);

    // Get count by status
    const statusBreakdown = await Resume.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Status breakdown:', statusBreakdown);

    // Get count by tag
    const tagBreakdown = await Resume.aggregate([
      { $group: { _id: "$tag", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Tag breakdown:', tagBreakdown);

    // Create status count map
    const statusCountMap = {};
    statusBreakdown.forEach(item => {
      statusCountMap[item._id] = item.count;
    });

    // Create tag count map
    const tagCountMap = {};
    tagBreakdown.forEach(item => {
      tagCountMap[item._id] = item.count;
    });

    // Format data according to the requirements
    const formattedData = [
      {
        name: 'Recommended',
        value: statusCountMap['submitted'] || 0,
        color: '#1557FF'
      },
      {
        name: 'shorted',
        value: statusCountMap['shortlisted'] || 0,
        color: '#030B1C'
      },
      {
        name: 'Sales',
        value: tagCountMap['Sales'] || 0,
        color: '#FF7A00'
      },
      {
        name: 'Interview',
        value: statusCountMap['screening'] || 0,
        color: '#5A6A7A'
      },
      {
        name: 'Finance',
        value: tagCountMap['Finance'] || 0,
        color: '#FFC700'
      },
      {
        name: 'Hired',
        value: statusCountMap['hired'] || 0,
        color: '#4EFFB6'
      }
    ];

    console.log('Formatted data for account manager:', formattedData);

    res.status(200).json({
      total: totalResumes,
      data: formattedData
    });
  } catch (err) {
    console.error("Error fetching resume statistics for account manager:", err);
    res.status(500).json({ message: "Failed to retrieve resume statistics", error: err.message });
  }
};

// @desc Get shortlisted resumes for account manager dashboard
export const getShortlistedResumesForAccountManager = async (req, res) => {
  try {
    console.log('getShortlistedResumesForAccountManager called');

    // Get all shortlisted resumes
    const shortlistedResumes = await Resume.find({ status: 'shortlisted' })
      .select('name email title status createdAt overallScore ats_score')
      .sort({ createdAt: -1 })
      .limit(6); // Limit to 6 for the dashboard

    console.log('Shortlisted resumes found:', shortlistedResumes.length);

    res.status(200).json(shortlistedResumes);
  } catch (err) {
    console.error("Error fetching shortlisted resumes for account manager:", err);
    res.status(500).json({ message: "Failed to retrieve shortlisted resumes", error: err.message });
  }
};

// @desc Get full resume details for scorecard generation
export const getResumeForScorecard = async (req, res) => {
  try {
    const { resumeId } = req.params;
    console.log('getResumeForScorecard called for resumeId:', resumeId);

    // Get the full resume details
    const resume = await Resume.findById(resumeId);
    
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    console.log('Resume found for scorecard:', resume.name);

    res.status(200).json(resume);
  } catch (err) {
    console.error("Error fetching resume for scorecard:", err);
    res.status(500).json({ message: "Failed to retrieve resume", error: err.message });
  }
};

// @desc Get monthly resume submission data for the last 7 months
export const getMonthlySubmissionData = async (req, res) => {
  try {
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get current date and calculate 7 months ago
    const currentDate = new Date();
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(currentDate.getMonth() - 6); // 6 months back + current month = 7 months

    // Build match query based on user role
    let matchQuery = { createdAt: { $gte: sevenMonthsAgo } };
    if (userRole === 'manager') {
      matchQuery.managerId = new mongoose.Types.ObjectId(userId);
    } else {
      matchQuery.recruiterId = new mongoose.Types.ObjectId(userId);
    }

    // Aggregate resumes by month for the last 7 months
    const monthlyData = await Resume.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Create a map of month-year to count
    const monthCountMap = {};
    monthlyData.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      monthCountMap[key] = item.count;
    });

    // Generate data for the last 7 months
    const result = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() returns 0-11
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      result.push({
        name: monthNames[month - 1],
        uv: monthCountMap[key] || 0
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("Error fetching monthly submission data:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve monthly submission data", 
      error: err.message 
    });
  }
};

// @desc Get monthly shortlist vs non-shortlist data for the last 7 months
export const getMonthlyShortlistData = async (req, res) => {
  try {
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get current date and calculate 7 months ago
    const currentDate = new Date();
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(currentDate.getMonth() - 6); // 6 months back + current month = 7 months

    // Build match query based on user role
    let matchQuery = { createdAt: { $gte: sevenMonthsAgo } };
    if (userRole === 'manager') {
      matchQuery.managerId = new mongoose.Types.ObjectId(userId);
    } else {
      matchQuery.recruiterId = new mongoose.Types.ObjectId(userId);
    }

    // Aggregate resumes by month and status for the last 7 months
    const monthlyData = await Resume.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Create a map of month-year to status counts
    const monthStatusMap = {};
    monthlyData.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      if (!monthStatusMap[key]) {
        monthStatusMap[key] = { shortlisted: 0, total: 0 };
      }
      
      if (item._id.status === 'shortlisted') {
        monthStatusMap[key].shortlisted += item.count;
      }
      monthStatusMap[key].total += item.count;
    });

    // Generate data for the last 7 months
    const result = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() returns 0-11
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      const monthData = monthStatusMap[key] || { shortlisted: 0, total: 0 };
      const notShortlisted = monthData.total - monthData.shortlisted;
      
      result.push({
        name: monthNames[month - 1],
        Shortlist: monthData.shortlisted,
        'Not Shortlist': notShortlisted
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("Error fetching monthly shortlist data:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve monthly shortlist data", 
      error: err.message 
    });
  }
};

// @desc Get average score data for a user (recruiter or manager)
export const getAverageScoreData = async (req, res) => {
  try {
    const userId = req.id; // Get user ID from auth middleware
    const userRole = req.role; // Get user role from auth middleware
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Build query based on user role
    let query = { totalscore: { $gt: 0 } }; // Only include resumes with totalscore > 0
    if (userRole === 'manager') {
      query.managerId = new mongoose.Types.ObjectId(userId);
    } else {
      query.recruiterId = new mongoose.Types.ObjectId(userId);
    }

    // Get all resumes for this user that have totalscore > 0
    const resumes = await Resume.find(query);

    if (resumes.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalScore: 0,
          totalTotalScore: 0,
          averageScore: 0,
          percentage: 0
        }
      });
    }

    // Calculate total score and total totalscore
    const totalScore = resumes.reduce((sum, resume) => sum + (resume.score || 0), 0);
    const totalTotalScore = resumes.reduce((sum, resume) => sum + (resume.totalscore || 0), 0);
    
    // Calculate average score percentage
    const averageScore = totalTotalScore > 0 ? Math.round((totalScore / totalTotalScore) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalScore,
        totalTotalScore,
        averageScore,
        percentage: averageScore
      }
    });
  } catch (err) {
    console.error("Error fetching average score data:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve average score data", 
      error: err.message 
    });
  }
};

// @desc Save interview evaluation results
export const saveInterviewEvaluation = async (req, res) => {
  try {
    console.log('saveInterviewEvaluation called with:', {
      resumeId: req.params.resumeId,
      body: req.body,
      headers: req.headers
    });

    const { resumeId } = req.params;
    const { evaluationResults, questions, answers, status } = req.body;

    if (!resumeId) {
      console.log('Missing resumeId');
      return res.status(400).json({ message: "Resume ID is required" });
    }

    if (!evaluationResults || !Array.isArray(evaluationResults)) {
      console.log('Invalid evaluationResults:', evaluationResults);
      return res.status(400).json({ message: "Evaluation results are required" });
    }

    console.log('Updating resume with evaluation data...');

    // Calculate score and totalscore
    const totalScore = evaluationResults.reduce((sum, result) => sum + (result.score || 0), 0);
    const totalQuestions = evaluationResults.length;
    const totalscore = totalQuestions * 10; // 10 points per question

    console.log('Calculated scores:', { totalScore, totalQuestions, totalscore });

    // Update resume with interview evaluation results, status, and scores
    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      {
        interviewEvaluation: {
          evaluationResults,
          questions,
          answers,
          evaluatedAt: new Date()
        },
        status: status || 'screening',
        score: totalScore,
        totalscore: totalscore
      },
      { new: true }
    );

    if (!updatedResume) {
      console.log('Resume not found:', resumeId);
      return res.status(404).json({ message: "Resume not found" });
    }

    console.log('Resume updated successfully:', updatedResume._id);

    // Increment interviewed_number for the job when transcript is submitted
    if (updatedResume.jobId) {
      await Job.findByIdAndUpdate(updatedResume.jobId, { $inc: { interviewed_number: 1 } });
      console.log('Incremented interviewed_number for job:', updatedResume.jobId);
    }

    res.status(200).json({ 
      message: "Interview evaluation saved successfully", 
      resume: updatedResume 
    });
  } catch (error) {
    console.error("Error saving interview evaluation:", error);
    res.status(500).json({ message: "Failed to save interview evaluation", error: error.message });
  }
};

// @desc Get resumes by manager ID for scorecard review
export const getResumesByManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    
    if (!managerId) {
      return res.status(400).json({ message: "Manager ID is required" });
    }

    // Validate if managerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ message: "Invalid managerId format" });
    }

    // Get all resumes for this manager
    const resumes = await Resume.find({ managerId });

    // Calculate statistics
    const totalResumes = resumes.length;
    const reviewedResumes = resumes.filter(resume => 
      resume.status === 'shortlisted' || resume.status === 'rejected' || resume.status === 'offered' || resume.status === 'hired'
    ).length;
    const pendingResumes = totalResumes - reviewedResumes;

    // Calculate percentage
    const reviewedPercent = totalResumes > 0 ? Math.round((reviewedResumes / totalResumes) * 100) : 0;
    const pendingPercent = 100 - reviewedPercent;

    res.status(200).json({
      success: true,
      data: {
        totalResumes,
        reviewedResumes,
        pendingResumes,
        reviewedPercent,
        pendingPercent
      },
      resumes: resumes // Include the actual resumes data for pipeline processing
    });
  } catch (err) {
    console.error("Error fetching resumes by manager:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve resumes by manager", 
      error: err.message 
    });
  }
};