# Zepul Account Manager System - Technical Documentation

**Document Version:** 1.0  
**Date:** December 2024  
**System:** Zepul Recruitment Platform  
**Module:** Account Manager Dashboard & Management System  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Account Manager Dashboard Logic](#account-manager-dashboard-logic)
4. [Jobs Management System](#jobs-management-system)
5. [Company Management System](#company-management-system)
6. [Candidate Management & Resume Processing](#candidate-management--resume-processing)
7. [Job Detail Page Functionality](#job-detail-page-functionality)
8. [Profile & Settings Management](#profile--settings-management)
9. [System Architecture](#system-architecture)
10. [Technical Implementation Details](#technical-implementation-details)
11. [User Workflows](#user-workflows)
12. [Conclusion](#conclusion)
  
---

## Executive Summary

The Zepul Account Manager System is a comprehensive client relationship and recruitment oversight platform designed to empower account managers with tools for client management, job oversight, candidate pipeline tracking, and strategic decision-making. The system provides account managers with centralized control over client relationships and recruitment processes.

**Key Features:**
- Client relationship management and oversight
- Job creation, assignment, and monitoring
- Candidate pipeline tracking and analytics
- Resume processing and evaluation system
- Company profile management
- Performance analytics and reporting
- Real-time dashboard analytics

---

## System Overview

### User Hierarchy
The system operates on a hierarchical structure:

1. **Administrators**: System-wide access, create account managers, oversee operations
2. **Account Managers**: Manage client relationships, create jobs, monitor recruitment processes
3. **Managers**: Execute recruitment tasks under account manager supervision
4. **Recruiters**: Execute recruitment tasks under manager supervision

### Core Components
- **Dashboard**: Central command center with client and job analytics
- **Jobs Management**: Job creation, assignment, and monitoring
- **Company Management**: Client profile and relationship management
- **Candidate Management**: Resume processing and evaluation system
- **Profile Management**: Personal settings and account configuration

---

## Account Manager Dashboard Logic

### Dashboard Structure

The account manager dashboard serves as the primary interface, providing:

**Navigation Sidebar:**
- Dashboard (main view)
- Jobs (job management)
- Company (client management)
- Settings (account management)

**Main Dashboard Components:**

1. **Header Section**
   - User information and quick actions
   - System notifications and alerts

2. **Statistics Overview**
   - Total Jobs: Number of active positions
   - Active Jobs: Currently managed positions
   - Candidates in Pipeline: Total applications
   - Success Ratio: Recruitment performance metrics

3. **Analytics Charts**
   - Resume pipeline visualization
   - Company job distribution
   - Interview status tracking
   - Performance metrics

### Data Flow Logic

**Statistics Calculation:**
```javascript
// Example: How account manager stats are calculated
const fetchAccountManagerStats = async () => {
  // Fetch resume statistics
  const statsResponse = await fetch('/api/accountmanager/resumes/stats');
  const statsData = await statsResponse.json();
  
  // Fetch jobs created by this account manager
  const jobsResponse = await fetch('/api/accountmanager/getjob');
  const jobsData = await jobsResponse.json();
  
  // Fetch shortlisted resumes
  const shortlistedResponse = await fetch('/api/accountmanager/resumes/shortlisted');
  const shortlistedData = await shortlistedResponse.json();
  
  // Calculate metrics
  const totalJobs = jobsData.jobs?.length || 0;
  const activeJobs = jobsData.jobs?.filter(job => !job.isClosed).length || 0;
  const candidatesInPipeline = statsData.total || 0;
  
  // Update dashboard display
  setStats(calculatedMetrics);
};
```

**Real-time Updates:**
- Statistics refresh automatically when data changes
- Charts update based on current time periods
- Performance metrics calculate trends and percentages

### Dashboard Analytics

**Resume Pipeline Visualization:**
```javascript
const resumeStats = {
  total: 0,
  data: [
    { name: 'Recommended', value: 0, color: '#1557FF' },
    { name: 'Shortlisted', value: 0, color: '#030B1C' },
    { name: 'Sales', value: 0, color: '#FF7A00' },
    { name: 'Interview', value: 0, color: '#5A6A7A' },
    { name: 'Finance', value: 0, color: '#FFC700' },
    { name: 'Hired', value: 0, color: '#4EFFB6' }
  ]
};
```

**Company Job Distribution:**
- Track jobs by company
- Monitor active vs. total positions
- Visual progress indicators
- Top 5 companies by job count

**Interview Status Tracking:**
- Monitor shortlisted and rejected candidates
- Track recruiter assignments
- Performance analytics by recruiter

---

## Jobs Management System

### Job Creation and Management

**Job Creation Process:**
```javascript
const createJob = async (jobData) => {
  // Validate job requirements
  const validation = validateJobData(jobData);
  
  // Create job with account manager association
  const job = await createJob({
    ...jobData,
    accountManagerId: currentAccountManagerId,
    status: 'active',
    isAssigned: false
  });
  
  return job;
};
```

**Job Information Structure:**
- Job title and description
- Company and location details
- Salary range and experience requirements
- Required skills and qualifications
- Key responsibilities
- Employment type and priority level
- Hiring deadline and internal notes

### Job Assignment Logic

**Assignment Process:**
1. **Job Creation**: Account manager creates job posting
2. **Manager Selection**: Choose from available managers
3. **Assignment**: Assign job to selected manager(s)
4. **Notification**: Notify managers of new assignments
5. **Tracking**: Monitor job progress and candidate submissions

**Assignment Criteria:**
- Manager availability and workload
- Specialization and expertise
- Performance history
- Geographic location preferences

### Job Status Management

**Status Categories:**
- **Active**: Open for applications
- **Assigned**: Given to managers
- **In Progress**: Candidates being evaluated
- **Closed**: Position filled or expired
- **On Hold**: Temporarily suspended

**Status Transition Logic:**
```javascript
const updateJobStatus = async (jobId, newStatus) => {
  const job = await Job.findById(jobId);
  
  // Validate status transition
  const validTransition = validateStatusTransition(job.status, newStatus);
  
  if (validTransition) {
    job.status = newStatus;
    job.updatedAt = new Date();
    
    // Update related metrics
    if (newStatus === 'closed') {
      job.isClosed = true;
      await updateManagerMetrics(job.assignedManagers);
    }
    
    await job.save();
    return job;
  }
  
  throw new Error('Invalid status transition');
};
```

---

## Company Management System

### Client Profile Management

**Company Information:**
- Company name and description
- Industry and size
- Location and contact details
- Website and domain information
- Company type and employee count
- Director and founder information
- Internal notes and about section

**Company-Job Relationship:**
```javascript
const manageCompanyJobs = async (companyId) => {
  // Fetch company details
  const company = await Company.findById(companyId)
    .populate('jobs');
  
  // Get job statistics
  const jobStats = await calculateJobStats(company.jobs);
  
  // Get manager assignments
  const assignments = await getManagerAssignments(company.jobs);
  
  return { company, jobStats, assignments };
};
```

### Job Assignment to Managers

**Assignment Interface:**
- View all jobs for the company
- Select managers for each job
- Manage workload distribution
- Track assignment status

**Assignment Logic:**
```javascript
const assignJobToManagers = async (jobId, managerIds) => {
  // Validate managers exist and are active
  const managers = await validateManagers(managerIds);
  
  // Update job assignment
  const job = await Job.findByIdAndUpdate(jobId, {
    assignedManagers: managerIds,
    isAssigned: true,
    assignedAt: new Date()
  });
  
  // Notify managers
  await notifyManagers(managerIds, job);
  
  return job;
};
```

### Client Relationship Tracking

**Relationship Metrics:**
- Total jobs per client
- Success rate per client
- Average time to hire
- Client satisfaction scores
- Revenue tracking

---

## Candidate Management & Resume Processing

### Resume Processing System

**Resume Upload and Analysis:**
```javascript
const processResume = async (file, jobDetails) => {
  // Extract text from resume
  const text = await extractTextFromFile(file);
  
  // Analyze resume with AI
  const analysis = await analyzeResume(text, jobDetails);
  
  // Calculate ATS score
  const atsResult = await fetchATSScore(text);
  
  // Save to database
  const saved = await saveResumeToDB({
    ...analysis,
    overallScore: atsResult.ats_score,
    jobId: jobDetails.jobId,
    accountManagerId: currentAccountManagerId
  });
  
  return saved;
};
```

**AI Analysis Components:**
- Technical experience assessment
- Project experience evaluation
- Education verification
- Key achievements analysis
- Skill match calculation
- Competitive fit assessment
- Consistency check

### Candidate Pipeline Management

**Pipeline Stages:**
- **Screening**: Initial evaluation phase
- **Shortlisted**: Approved for interview
- **Interviewed**: Interview completed
- **Submitted to Account Manager**: Ready for review
- **Approved**: Final approval given
- **Rejected**: Not selected

**Pipeline Tracking:**
```javascript
const fetchCandidatePipeline = async (jobId) => {
  // Fetch all candidates for this job
  const candidates = await Scorecard.find({ jobId })
    .populate('resume')
    .populate('candidateId')
    .sort({ createdAt: -1 });
  
  // Group by status
  const groupedCandidates = groupCandidatesByStatus(candidates);
  
  // Calculate statistics
  const stats = calculateCandidateStats(candidates);
  
  return { candidates, groupedCandidates, stats };
};
```

### Resume Evaluation System

**Evaluation Criteria:**
- Technical skills assessment
- Communication and soft skills
- Experience relevance
- Cultural fit evaluation
- Overall recommendation

**Scorecard Review Process:**
1. **Manager Evaluation**: Manager conducts interview and evaluation
2. **Scorecard Submission**: Manager submits detailed assessment
3. **Account Manager Review**: Account manager reviews scorecard and candidate details
4. **Decision Making**: Approve, reject, or request additional rounds
5. **Feedback Loop**: Provide feedback to manager

---

## Job Detail Page Functionality

### Page Structure

**Main Components:**
1. **Job Information Panel**
   - Complete job description and requirements
   - Company and location details
   - Salary and experience information
   - Assignment status and manager details

2. **Candidate Pipeline**
   - Total applications received
   - Candidates by status (screening, shortlisted, interviewed)
   - Progress tracking and metrics

3. **Resume Management**
   - View all resumes submitted for the job
   - Filter by status and manager
   - Access candidate details and evaluations

4. **Analytics Dashboard**
   - Application statistics
   - Progress tracking charts
   - Performance metrics

### Resume Management

**Resume Processing Flow:**
```javascript
const fetchJobResumes = async (jobId) => {
  // Fetch all resumes for this job
  const resumes = await Resume.find({ jobId })
    .populate('managerId', 'fullname email')
    .sort({ createdAt: -1 });
  
  // Group by status
  const groupedResumes = groupResumesByStatus(resumes);
  
  // Calculate statistics
  const stats = calculateResumeStats(resumes);
  
  return { resumes, groupedResumes, stats };
};
```

**Resume Status Tracking:**
- **Screening**: Initial evaluation phase
- **Shortlisted**: Approved for interview
- **Interviewed**: Interview completed
- **Submitted to Account Manager**: Ready for review
- **Approved**: Final approval given
- **Rejected**: Not selected

### Candidate Evaluation System

**Scorecard Review Process:**
1. **Manager Evaluation**: Manager conducts interview and evaluation
2. **Scorecard Submission**: Manager submits detailed assessment
3. **Account Manager Review**: Account manager reviews scorecard and candidate details
4. **Decision Making**: Approve, reject, or request additional rounds
5. **Feedback Loop**: Provide feedback to manager

**Evaluation Criteria:**
- Technical skills assessment
- Communication and soft skills
- Experience relevance
- Cultural fit evaluation
- Overall recommendation

---

## Profile & Settings Management

### Account Information Management

**Profile Data Structure:**
```javascript
const profileData = {
  fullname: 'Account Manager Name',
  email: 'accountmanager@company.com',
  phone: '+1234567890',
  DOB: '1990-01-01',
  gender: 'Male/Female/Other',
  onboardedBy: 'Admin Name',
  createdAt: '2024-01-01',
  updatedAt: '2024-12-01'
};
```

**Update Process:**
1. **Data Validation**: Verify input format and requirements
2. **Database Update**: Save changes to user profile
3. **Confirmation**: Display success/error messages
4. **Refresh**: Update displayed information

### Password Security

**Password Change Flow:**
```javascript
const changePassword = async (oldPassword, newPassword) => {
  // Validate current password
  const isValid = await verifyPassword(oldPassword);
  
  // Validate new password requirements
  const requirements = validatePasswordRequirements(newPassword);
  
  // Update password in database
  const updated = await updatePassword(newPassword);
  
  return updated;
};
```

**Security Requirements:**
- Minimum 8 characters
- Must be different from current password
- Encrypted storage in database
- Session invalidation after change

### Email Notification Settings

**Notification Types:**
- New job assignments
- Candidate status updates
- Manager performance alerts
- Client communication updates
- System updates and announcements

**Configuration Options:**
- Enable/disable specific notification types
- Frequency settings (immediate, daily, weekly)
- Email format preferences

---

## System Architecture

### Technology Stack

**Frontend:**
- React.js with functional components
- Tailwind CSS for styling
- React Router for navigation
- React Hot Toast for notifications
- Recharts for data visualization

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Email service integration

**Data Visualization:**
- Recharts library for analytics
- Custom pipeline visualization
- Performance tracking charts

### Database Schema

**Account Manager Model:**
```javascript
const accountManagerSchema = {
  email: String (unique),
  password: String (encrypted),
  username: String (unique),
  fullname: String,
  DOB: Date,
  gender: Enum ['Male', 'Female', 'Other'],
  phone: String,
  type: String (default: 'accountmanager'),
  adminId: ObjectId (reference),
  status: String (enum: ['active', 'disabled']),
  totalHires: Number,
  offersMade: Number,
  offersAccepted: Number,
  jobs: [ObjectId] (reference),
  assignedCompanies: [ObjectId] (reference)
};
```

**Job Model:**
```javascript
const jobSchema = {
  jobtitle: String,
  company: String,
  description: String,
  requirements: [String],
  skills: [String],
  experience: Number,
  salary: {
    min: Number,
    max: Number
  },
  location: String,
  type: String (enum: ['remote', 'onsite']),
  employmentType: String,
  priority: [String] (enum: ['Low', 'Medium', 'High']),
  accountManagerId: ObjectId (reference),
  assignedManagers: [ObjectId] (reference),
  status: String,
  isClosed: Boolean,
  hiringDeadline: Date,
  totalApplication_number: Number,
  shortlisted_number: Number,
  interviewed_number: Number,
  "2ndround_interviewed_number": Number
};
```

### API Endpoints

**Account Manager Endpoints:**
- `GET /api/accountmanager/profile` - Get profile information
- `PUT /api/accountmanager/profile` - Update profile
- `PUT /api/accountmanager/update-password` - Change password
- `GET /api/accountmanager/getjob` - Get account manager's jobs
- `POST /api/jobs/accountmanager/addjob` - Create new job
- `PUT /api/accountmanager/job/:jobId` - Update job details

**Company Management Endpoints:**
- `GET /api/company/getcompany` - Get all companies
- `POST /api/company/addcompany` - Create new company
- `PUT /api/company/:companyId` - Update company details
- `GET /api/accountmanager/companymanagement` - Get company management data

**Resume Management Endpoints:**
- `GET /api/accountmanager/resumes/stats` - Get resume statistics
- `GET /api/accountmanager/resumes/shortlisted` - Get shortlisted resumes
- `GET /api/accountmanager/resumes/job/:jobId` - Get resumes by job
- `PUT /api/accountmanager/resumes/:resumeId` - Update resume status

---

## Technical Implementation Details

### Authentication & Authorization

**JWT Token System:**
```javascript
const generateAccountManagerToken = (accountManager) => {
  return jwt.sign(
    { id: accountManager._id, type: accountManager.type },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
```

**Middleware Protection:**
- Route-level authentication checks
- Role-based access control (account manager only)
- Token validation on each request

### Error Handling

**Global Error Management:**
```javascript
const accountManagerErrorHandler = (error, req, res, next) => {
  console.error('Account Manager Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: error.errors
    });
  }
  
  return res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};
```

### Data Validation

**Input Validation:**
- Form field validation
- Email format verification
- Password strength requirements
- Job data validation
- Company information validation

### Performance Optimization

**Caching Strategy:**
- Redis caching for frequently accessed data
- Database query optimization
- Image and file compression
- Lazy loading for large datasets

---

## User Workflows

### New Account Manager Onboarding

1. **Account Creation**: Admin creates account manager account
2. **Initial Login**: Account manager logs in with temporary credentials
3. **Password Setup**: Account manager sets permanent password
4. **Profile Completion**: Fill in personal information
5. **Client Assignment**: Admin assigns clients to manage
6. **Training**: System tutorial and documentation access

### Daily Management Workflow

1. **Dashboard Review**: Check client statistics and pending tasks
2. **Client Management**: Review client relationships and job status
3. **Job Oversight**: Monitor job progress and candidate pipelines
4. **Candidate Reviews**: Review and approve candidate evaluations
5. **Performance Analysis**: Analyze client and job metrics
6. **Strategic Planning**: Plan resource allocation and improvements

### Client Management Process

1. **Client Onboarding**: Add new clients to the system
2. **Job Creation**: Create job postings for clients
3. **Manager Assignment**: Assign jobs to appropriate managers
4. **Progress Monitoring**: Track job progress and candidate flow
5. **Quality Control**: Review candidate evaluations and decisions
6. **Performance Analysis**: Analyze client satisfaction and success rates

### Job Management Process

1. **Job Creation**: Create new job postings with requirements
2. **Manager Assignment**: Assign jobs to appropriate managers
3. **Progress Monitoring**: Track job progress and candidate flow
4. **Quality Control**: Review candidate evaluations and decisions
5. **Performance Analysis**: Analyze job completion rates and success

---

## Conclusion

The Zepul Account Manager System represents a comprehensive solution for client relationship management and recruitment oversight. By providing centralized control and detailed analytics, the system enables account managers to:

**Key Benefits:**
- **Client Oversight**: Complete visibility into client relationships and job status
- **Strategic Control**: Manage job assignments and resource allocation
- **Quality Assurance**: Review and approve candidate evaluations
- **Performance Analytics**: Track client and job metrics
- **Efficient Workflow**: Streamlined processes for client management

**Future Enhancements:**
- Advanced analytics and predictive insights
- Automated performance recommendations
- Integration with external CRM systems
- Mobile application for account managers
- Advanced reporting and export features
- Multi-language support
- Client portal integration

The system successfully bridges the gap between client relationship management and operational execution, creating an efficient and effective recruitment management process.

---

**Document End**

*This documentation provides a comprehensive overview of the Zepul Account Manager System. For technical implementation details, please refer to the source code and API documentation.*
