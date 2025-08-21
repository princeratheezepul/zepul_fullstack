# Zepul Manager System - Technical Documentation

**Document Version:** 1.0  
**Date:** December 2024  
**System:** Zepul Recruitment Platform  
**Module:** Manager Dashboard & Management System  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Manager Dashboard Logic](#manager-dashboard-logic)
4. [Recruiters Management System](#recruiters-management-system)
5. [Jobs Management System](#jobs-management-system)
6. [Job Detail Page Functionality](#job-detail-page-functionality)
7. [Company Management](#company-management)
8. [Scorecard Reviews](#scorecard-reviews)
9. [Profile & Settings Management](#profile--settings-management)
10. [System Architecture](#system-architecture)
11. [Technical Implementation Details](#technical-implementation-details)
12. [User Workflows](#user-workflows)
13. [Conclusion](#conclusion)

---

## Executive Summary

The Zepul Manager System is a comprehensive team management and recruitment oversight platform designed to empower managers with tools for recruiter management, job oversight, performance tracking, and strategic decision-making. The system provides managers with centralized control over their recruitment teams and processes.

**Key Features:**
- Team management and recruiter oversight
- Job creation, assignment, and monitoring
- Performance analytics and reporting
- Candidate pipeline tracking
- Scorecard review and approval system
- Company and job management
- Real-time dashboard analytics

---

## System Overview

### User Hierarchy
The system operates on a hierarchical structure:

1. **Administrators**: System-wide access, create managers, oversee operations
2. **Managers**: Create recruiters, manage jobs, monitor team performance
3. **Recruiters**: Execute recruitment tasks under manager supervision

### Core Components
- **Dashboard**: Central command center with team and job analytics
- **Recruiters Management**: Team oversight and performance tracking
- **Jobs Management**: Job creation, assignment, and monitoring
- **Company Management**: Company profile and job management
- **Scorecard Reviews**: Candidate evaluation and approval system
- **Profile Management**: Personal settings and account configuration

---

## Manager Dashboard Logic

### Dashboard Structure

The manager dashboard serves as the primary interface, providing:

**Navigation Sidebar:**
- Dashboard (main view)
- My Team (recruiter management)
- List of Jobs (job management)
- Scorecard Reviews (candidate evaluation)
- Company (company management)
- Settings (account management)

**Main Dashboard Components:**

1. **Header Section**
   - User information and quick actions
   - System notifications and alerts

2. **Statistics Overview**
   - Total Recruiters: Number of team members
   - Active Jobs: Currently managed positions
   - Candidates in Pipeline: Total applications
   - Success Ratio: Team performance metrics

3. **Analytics Charts**
   - Candidate pipeline visualization
   - Recruiter performance trends
   - Job completion rates
   - Team productivity metrics

### Data Flow Logic

**Statistics Calculation:**
```javascript
// Example: How manager stats are calculated
const fetchManagerStats = async () => {
  // Fetch recruiters under this manager
  const recruitersResponse = await get('/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager');
  
  // Fetch jobs created by this manager
  const jobsResponse = await get('/api/manager/get-jobs/${managerId}');
  
  // Fetch candidate pipeline data
  const pipelineResponse = await get('/api/manager/resumes/manager/${managerId}');
  
  // Calculate metrics
  const totalRecruiters = recruitersData.recruiters?.length || 0;
  const activeJobs = jobsData.jobs?.filter(job => !job.isClosed).length || 0;
  const candidatesInPipeline = pipelineData.resumes?.length || 0;
  
  // Update dashboard display
  setStats(calculatedMetrics);
};
```

**Real-time Updates:**
- Statistics refresh automatically when data changes
- Charts update based on current time periods
- Performance metrics calculate trends and percentages

---

## Recruiters Management System

### Team Overview

**Recruiter List Management:**
- View all recruiters under the manager
- Search and filter recruiters by name, email, or status
- Sort by creation date, performance, or status
- Pagination for large teams (10 recruiters per page)

**Recruiter Status Management:**
- **Active**: Currently working and available
- **Inactive**: Temporarily unavailable or suspended
- **Performance Tracking**: Monitor individual recruiter metrics

### Recruiter Performance Analytics

**Performance Metrics:**
```javascript
const calculateRecruiterPerformance = (recruiter) => {
  return {
    jobsClosed: recruiter.jobsclosed || 0,
    avgTAT: recruiter.avgTAT || 0, // Average Turn Around Time
    qualityHeatmap: recruiter.qualityheatmap || 0,
    redFlags: recruiter.redflags || 0,
    offersMade: recruiter.offersMade || 0,
    totalHires: recruiter.totalHires || 0,
    successRatio: calculateSuccessRatio(recruiter)
  };
};
```

**Red Flag Analysis:**
- Track performance issues and concerns
- Monitor quality metrics and compliance
- Identify areas for improvement or training

### Add New Recruiter Process

**Recruiter Creation Flow:**
```javascript
const createRecruiter = async (recruiterData) => {
  // Validate recruiter information
  const validation = validateRecruiterData(recruiterData);
  
  // Create user account
  const user = await createUser({
    ...recruiterData,
    type: 'recruiter',
    managerId: currentManagerId
  });
  
  // Create recruiter profile
  const recruiter = await createRecruiter({
    ...recruiterData,
    userId: user._id,
    managerId: currentManagerId
  });
  
  // Generate password reset token for initial setup
  const resetToken = generateResetToken(user._id);
  
  // Send welcome email with setup instructions
  await sendWelcomeEmail(recruiter.email, resetToken);
  
  return { user, recruiter };
};
```

**Required Information:**
- Full name and contact details
- Email address (unique)
- Date of birth and gender
- Phone number
- Location and specialization

### Recruiter Performance Details

**Detailed Performance View:**
- Individual recruiter statistics
- Job assignment history
- Candidate submission rates
- Interview success rates
- Quality metrics and scores

**Performance Trends:**
- Monthly/quarterly performance tracking
- Comparison with team averages
- Improvement recommendations
- Training needs identification

---

## Jobs Management System

### Job Creation and Management

**Job Creation Process:**
```javascript
const createJob = async (jobData) => {
  // Validate job requirements
  const validation = validateJobData(jobData);
  
  // Create job with manager association
  const job = await createJob({
    ...jobData,
    managerId: currentManagerId,
    companyId: selectedCompanyId,
    status: 'active',
    isAssigned: false
  });
  
  // Update company job count
  await updateCompanyJobCount(selectedCompanyId);
  
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

### Job Assignment Logic

**Assignment Process:**
1. **Job Creation**: Manager creates job posting
2. **Recruiter Selection**: Choose from available recruiters
3. **Assignment**: Assign job to selected recruiter(s)
4. **Notification**: Notify recruiters of new assignments
5. **Tracking**: Monitor job progress and candidate submissions

**Assignment Criteria:**
- Recruiter availability and workload
- Specialization and expertise
- Performance history
- Geographic location preferences

### Job Status Management

**Status Categories:**
- **Active**: Open for applications
- **Assigned**: Given to recruiters
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
      await updateRecruiterMetrics(job.assignedRecruiters);
    }
    
    await job.save();
    return job;
  }
  
  throw new Error('Invalid status transition');
};
```

---

## Job Detail Page Functionality

### Page Structure

**Main Components:**
1. **Job Information Panel**
   - Complete job description and requirements
   - Company and location details
   - Salary and experience information
   - Assignment status and recruiter details

2. **Candidate Pipeline**
   - Total applications received
   - Candidates by status (screening, shortlisted, interviewed)
   - Progress tracking and metrics

3. **Resume Management**
   - View all resumes submitted for the job
   - Filter by status and recruiter
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
    .populate('recruiterId', 'fullname email')
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
- **Submitted to Manager**: Ready for review
- **Approved**: Final approval given
- **Rejected**: Not selected

### Candidate Evaluation System

**Scorecard Review Process:**
1. **Recruiter Evaluation**: Recruiter conducts interview and evaluation
2. **Scorecard Submission**: Recruiter submits detailed assessment
3. **Manager Review**: Manager reviews scorecard and candidate details
4. **Decision Making**: Approve, reject, or request additional rounds
5. **Feedback Loop**: Provide feedback to recruiter

**Evaluation Criteria:**
- Technical skills assessment
- Communication and soft skills
- Experience relevance
- Cultural fit evaluation
- Overall recommendation

---

## Company Management

### Company Profile Management

**Company Information:**
- Company name and description
- Industry and size
- Location and contact details
- Logo and branding materials
- Company culture and values

**Company-Job Relationship:**
```javascript
const manageCompanyJobs = async (companyId) => {
  // Fetch company details
  const company = await Company.findById(companyId)
    .populate('jobs');
  
  // Get job statistics
  const jobStats = await calculateJobStats(company.jobs);
  
  // Get recruiter assignments
  const assignments = await getRecruiterAssignments(company.jobs);
  
  return { company, jobStats, assignments };
};
```

### Job Assignment to Recruiters

**Assignment Interface:**
- View all jobs for the company
- Select recruiters for each job
- Manage workload distribution
- Track assignment status

**Assignment Logic:**
```javascript
const assignJobToRecruiters = async (jobId, recruiterIds) => {
  // Validate recruiters exist and are active
  const recruiters = await validateRecruiters(recruiterIds);
  
  // Update job assignment
  const job = await Job.findByIdAndUpdate(jobId, {
    assignedRecruiters: recruiterIds,
    isAssigned: true,
    assignedAt: new Date()
  });
  
  // Notify recruiters
  await notifyRecruiters(recruiterIds, job);
  
  return job;
};
```

---

## Scorecard Reviews

### Review Process Management

**Scorecard Submission Flow:**
1. **Recruiter Submission**: Recruiter submits candidate evaluation
2. **Manager Notification**: System notifies manager of new submission
3. **Review Process**: Manager reviews scorecard and candidate details
4. **Decision Making**: Approve, reject, or request changes
5. **Feedback Communication**: Provide feedback to recruiter

**Review Interface:**
```javascript
const fetchScorecardReviews = async (managerId) => {
  // Fetch pending reviews
  const pendingReviews = await Scorecard.find({
    status: 'submitted',
    managerId: managerId
  }).populate('candidateId recruiterId jobId');
  
  // Group by priority and date
  const groupedReviews = groupReviewsByPriority(pendingReviews);
  
  return { pendingReviews, groupedReviews };
};
```

### Review Decision Logic

**Decision Options:**
- **Approve**: Candidate approved for next round
- **Reject**: Candidate not suitable
- **Request Changes**: Ask recruiter for additional information
- **Schedule Interview**: Arrange manager interview

**Decision Processing:**
```javascript
const processReviewDecision = async (scorecardId, decision, feedback) => {
  const scorecard = await Scorecard.findById(scorecardId);
  
  // Update scorecard status
  scorecard.status = decision;
  scorecard.managerFeedback = feedback;
  scorecard.reviewedAt = new Date();
  
  // Update candidate status
  await updateCandidateStatus(scorecard.candidateId, decision);
  
  // Notify recruiter
  await notifyRecruiter(scorecard.recruiterId, decision, feedback);
  
  await scorecard.save();
  return scorecard;
};
```

---

## Profile & Settings Management

### Account Information Management

**Profile Data Structure:**
```javascript
const profileData = {
  fullname: 'Manager Name',
  email: 'manager@company.com',
  phone: '+1234567890',
  DOB: '1990-01-01',
  gender: 'Male/Female/Other',
  address: 'Manager Address',
  department: 'HR',
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
- New recruiter registrations
- Job assignment notifications
- Scorecard review requests
- Performance alerts
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

**Manager Model:**
```javascript
const managerSchema = {
  email: String (unique),
  password: String (encrypted),
  username: String (unique),
  fullname: String,
  DOB: Date,
  gender: Enum ['Male', 'Female', 'Other'],
  phone: String,
  address: String,
  department: String (default: 'HR'),
  type: String (default: 'manager'),
  adminId: ObjectId (reference),
  status: String (enum: ['active', 'disabled']),
  totalHires: Number,
  offersMade: Number,
  offersAccepted: Number,
  jobs: [ObjectId] (reference),
  assignedCompany: [ObjectId] (reference)
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
  managerId: ObjectId (reference),
  assignedRecruiters: [ObjectId] (reference),
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

**Manager Endpoints:**
- `GET /api/manager/profile` - Get profile information
- `PUT /api/manager/profile` - Update profile
- `PUT /api/manager/update-password` - Change password
- `GET /api/manager/get-jobs/:managerId` - Get manager's jobs
- `POST /api/manager/create-job` - Create new job
- `PUT /api/manager/job/:jobId` - Update job details

**Recruiter Management Endpoints:**
- `GET /api/recruiter/getrecruiter?creatorId=:managerId&type=manager` - Get recruiters
- `POST /api/recruiter/create` - Create new recruiter
- `DELETE /api/recruiter/:recruiterId` - Delete recruiter
- `GET /api/manager/resumes/manager/:managerId` - Get manager's resumes

**Scorecard Endpoints:**
- `GET /api/scorecard/manager/:managerId` - Get pending reviews
- `PUT /api/scorecard/:scorecardId/review` - Process review decision
- `GET /api/scorecard/statistics/:managerId` - Get review statistics

---

## Technical Implementation Details

### Authentication & Authorization

**JWT Token System:**
```javascript
const generateManagerToken = (manager) => {
  return jwt.sign(
    { id: manager._id, type: manager.type },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
```

**Middleware Protection:**
- Route-level authentication checks
- Role-based access control (manager only)
- Token validation on each request

### Error Handling

**Global Error Management:**
```javascript
const managerErrorHandler = (error, req, res, next) => {
  console.error('Manager Error:', error);
  
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
- Recruiter information validation

### Performance Optimization

**Caching Strategy:**
- Redis caching for frequently accessed data
- Database query optimization
- Image and file compression
- Lazy loading for large datasets

---

## User Workflows

### New Manager Onboarding

1. **Account Creation**: Admin creates manager account
2. **Initial Login**: Manager logs in with temporary credentials
3. **Password Setup**: Manager sets permanent password
4. **Profile Completion**: Fill in personal information
5. **Company Assignment**: Admin assigns companies to manage
6. **Training**: System tutorial and documentation access

### Daily Management Workflow

1. **Dashboard Review**: Check team statistics and pending tasks
2. **Team Management**: Review recruiter performance and assignments
3. **Job Oversight**: Monitor job progress and candidate pipelines
4. **Scorecard Reviews**: Review and approve candidate evaluations
5. **Performance Analysis**: Analyze team and individual metrics
6. **Strategic Planning**: Plan resource allocation and improvements

### Recruiter Management Process

1. **Recruiter Creation**: Add new recruiters to the team
2. **Job Assignment**: Assign jobs based on skills and availability
3. **Performance Monitoring**: Track individual and team performance
4. **Feedback and Coaching**: Provide guidance and support
5. **Performance Reviews**: Conduct regular performance assessments

### Job Management Process

1. **Job Creation**: Create new job postings with requirements
2. **Recruiter Assignment**: Assign jobs to appropriate recruiters
3. **Progress Monitoring**: Track job progress and candidate flow
4. **Quality Control**: Review candidate evaluations and decisions
5. **Performance Analysis**: Analyze job completion rates and success

---

## Conclusion

The Zepul Manager System represents a comprehensive solution for recruitment team management and oversight. By providing centralized control and detailed analytics, the system enables managers to:

**Key Benefits:**
- **Team Oversight**: Complete visibility into recruiter performance and activities
- **Strategic Control**: Manage job assignments and resource allocation
- **Quality Assurance**: Review and approve candidate evaluations
- **Performance Analytics**: Track team and individual metrics
- **Efficient Workflow**: Streamlined processes for team management

**Future Enhancements:**
- Advanced analytics and predictive insights
- Automated performance recommendations
- Integration with external HR systems
- Mobile application for managers
- Advanced reporting and export features
- Multi-language support

The system successfully bridges the gap between strategic management and operational execution, creating an efficient and effective recruitment management process.

---

**Document End**

*This documentation provides a comprehensive overview of the Zepul Manager System. For technical implementation details, please refer to the source code and API documentation.*
