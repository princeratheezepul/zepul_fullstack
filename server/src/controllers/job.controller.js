import { Job } from "../models/job.model.js";

export const createJob = async (req, res) => {
    console.log(req.body);
    const { jobtitle, description, location, salary, openpositions, skills, experience, companyId, company, keyResponsibilities, preferredQualifications, priority, employmentType, hiringDeadline, internalNotes } = req.body;
    console.log("companyId:", companyId);
    console.log("company:", company);
    console.log("hiringDeadline:", hiringDeadline);

    try {
        let job = await Job.findOne({ jobtitle });
        if (job) {
            return res.status(400).json({
                message: "You can't register the same job.",
                success: false
            });
        }

        // Determine the creator type based on user type
        const jobData = {
            jobtitle,
            description,
            location,
            salary,
            openpositions,
            skills,
            experience,
            companyId,
            company,
            keyResponsibilities,
            preferredQualifications,
            priority,
            employmentType,
            hiringDeadline: hiringDeadline ? new Date(hiringDeadline) : null,
            internalNotes: internalNotes || ""
        };

        // Set the appropriate creator ID based on user type
        if (req.user.type === 'accountmanager') {
            jobData.accountManagerId = req.user._id;
        } else if (req.user.type === 'manager') {
            jobData.managerId = req.user._id;
        } else {
            jobData.adminId = req.user._id;
        }

        job = await Job.create(jobData);

        return res.status(201).json({
            message: "Job registered successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error registering the job.",
            success: false
        });
    }
};


export const getAllJobs = async (req, res) => {
    try {
        const companyId = req.query.companyId; 
        console.log("companyId", companyId);
        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required.' });
        }

        const jobs = await Job.find({ companyId })
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username');
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


export const updateJob = async (req, res) => {
    try {
        const { jobtitle, description, location, salary, openpositions, skills, experience, companyId, internalNotes } = req.body;
        const jobId = req.params.id;

        const job = await Job.findByIdAndUpdate(jobId, {
            jobtitle,
            description,
            location,
            salary,
            openpositions,
            skills,
            experience,
            companyId,
            internalNotes: internalNotes || ""
        }, { new: true });

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
        console.log(error);
        return res.status(500).json({
            message: "Error updating the job.",
            success: false
        });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByIdAndDelete(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job deleted successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error deleting the job.",
            success: false
        });
    }
};


export const assignJob = async (req, res) => {
    const { recruiterId, isAssigned } = req.body;
    const { jobId } = req.params;

    try {
        const job = await Job.findByIdAndUpdate(
            jobId,
            { recruiterId, isAssigned },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        return res.status(200).json({
            message: "Job assigned successfully",
            job,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error assigning job",
            success: false
        });
    }
};

export const getJobById = async (req, res) => {
  const { id:jobId } = req.params;

  try {
    const job = await Job.findById(jobId)
      .populate('companyId', 'name logo')
      .populate('adminId', 'fullname username')
      .populate('managerId', 'fullname username');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// New function for admin to get job details
export const getAdminJobById = async (req, res) => {
  const { id:jobId } = req.params;

  try {
    const job = await Job.findById(jobId)
      .populate('companyId', 'name logo')
      .populate('adminId', 'fullname username')
      .populate('managerId', 'fullname username');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Add status based on priority and creation date
    const jobObj = job.toObject();
    const createdAt = new Date(job.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    let status = null;
    if (job.isClosed) {
      status = 'Close';
    } else if (job.priority && job.priority.includes('High')) {
      status = 'Urgent';
    } else if (daysSinceCreation <= 7) {
      status = 'New';
    }

    return res.status(200).json({ 
      job: {
        ...jobObj,
        status,
        companyName: job.companyId?.name,
        companyLogo: job.companyId?.logo
      }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// New function for admin dashboard with pagination and filtering
export const getAdminJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, filter = 'all' } = req.query;
        const adminId = req.user._id;
        
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;
        
        // Build filter conditions
        let filterConditions = { adminId };
        
        switch (filter) {
            case 'opened':
                filterConditions.isClosed = { $ne: true }; // All jobs that are not explicitly closed
                break;
            case 'urgent':
                filterConditions.priority = { $in: ['High'] };
                break;
            case 'closed':
                filterConditions.isClosed = true;
                break;
            default:
                // 'all' - no additional filter
                break;
        }
        
        // Get jobs with pagination
        const jobs = await Job.find(filterConditions)
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username')
            .sort({ createdAt: -1 }) // Recent jobs first
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination
        const totalJobs = await Job.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalJobs / limit);
        
        // Process jobs to add status
        const processedJobs = jobs.map(job => {
            const jobObj = job.toObject();
            const createdAt = new Date(job.createdAt);
            const now = new Date();
            const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
            
            // Determine status based on priority
            let status = null;
            if (job.isClosed) {
                status = 'Close';
            } else if (job.priority && job.priority.includes('High')) {
                status = 'Urgent';
            } else if (daysSinceCreation <= 7) {
                status = 'New';
            }
            
            return {
                ...jobObj,
                status,
                posted: createdAt.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })
            };
        });
        
        return res.status(200).json({
            message: "Jobs fetched successfully.",
            data: {
                jobs: processedJobs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalJobs,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            },
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

// Function to get job counts for filters
export const getJobCounts = async (req, res) => {
    try {
        const adminId = req.user._id;
        
        // Get counts for different filters
        const allJobs = await Job.countDocuments({ adminId });
        const closedJobs = await Job.countDocuments({ adminId, isClosed: true });
        const openedJobs = await Job.countDocuments({ adminId, isClosed: { $ne: true } }); // All jobs that are not explicitly closed
        const urgentJobs = await Job.countDocuments({ adminId, priority: { $in: ['High'] } });
        
        return res.status(200).json({
            message: "Job counts fetched successfully.",
            data: {
                all: allJobs,
                opened: openedJobs,
                urgent: urgentJobs,
                closed: closedJobs
            },
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching job counts.",
            success: false
        });
    }
};






