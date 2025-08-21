# Zepul Recruiter System - Technical Documentation

**Document Version:** 1.0  
**Date:** December 2024  
**System:** Zepul Recruitment Platform  
**Module:** Recruiter Dashboard & Management System  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Recruiter Dashboard Logic](#recruiter-dashboard-logic)
4. [Jobs Management System](#jobs-management-system)
5. [ZepDB - AI-Powered Database](#zepdb-ai-powered-database)
6. [Job Detail Page Functionality](#job-detail-page-functionality)
7. [Resume Processing & Interview System](#resume-processing--interview-system)
8. [Scorecard System - Comprehensive Analysis](#scorecard-system---comprehensive-analysis)
9. [Candidate Lifecycle Management](#candidate-lifecycle-management)
10. [Profile & Settings Management](#profile--settings-management)
11. [System Architecture](#system-architecture)
12. [Technical Implementation Details](#technical-implementation-details)
13. [User Workflows](#user-workflows)
14. [Conclusion](#conclusion)

---

## Executive Summary

The Zepul Recruiter System is a comprehensive recruitment management platform designed to streamline the hiring process through AI-powered automation and intelligent candidate management. The system provides recruiters with tools for job management, candidate sourcing, resume analysis, interview conduction, and performance tracking.

**Key Features:**
- AI-powered resume analysis and candidate matching
- Natural language query processing for candidate search
- Automated interview question generation and evaluation
- Real-time performance tracking and analytics
- Multi-stage candidate pipeline management
- Integrated communication and notification system

---

## System Overview

### User Hierarchy
The system operates on a three-tier hierarchy:

1. **Administrators**: System-wide access, create managers, oversee operations
2. **Managers**: Create recruiters, assign jobs, monitor team performance
3. **Recruiters**: Execute recruitment tasks, manage candidates, conduct interviews

### Core Components
- **Dashboard**: Central command center with analytics and quick actions
- **Jobs Management**: Assignment, tracking, and status management
- **ZepDB**: AI-powered candidate database with natural language search
- **Resume Processing**: Automated analysis and scoring system
- **Interview Management**: AI-assisted question generation and evaluation
- **Profile Management**: Personal settings and account configuration

---

## Recruiter Dashboard Logic

### Dashboard Structure

The recruiter dashboard serves as the primary interface, providing:

**Navigation Sidebar:**
- Dashboard (main view)
- Jobs (assigned job management)
- ZepDB (AI candidate search)
- Settings (account management)

**Main Dashboard Components:**

1. **Header Section**
   - User information and quick actions
   - System notifications and alerts

2. **Statistics Group**
   - Total Jobs: Number of assigned positions
   - Candidates in Process: Active applications
   - Interviews Scheduled: Upcoming interviews
   - Feedback Pending: Awaiting responses
   - Offers Made: Successful placements
   - Success Ratio: Performance metrics

3. **Analytics Charts**
   - Candidate submission trends
   - Application volume tracking
   - Average score analysis
   - Shortlist progression metrics

### Data Flow Logic

**Statistics Calculation:**
```javascript
// Example: How stats are calculated
const fetchStats = async () => {
  // Fetch jobs assigned to recruiter
  const jobsResponse = await get('/api/recruiter/assigned-jobs');
  
  // Fetch resumes submitted by recruiter
  const resumesResponse = await get('/api/resumes/recruiter');
  
  // Calculate metrics
  const totalJobs = jobsData.jobs?.length || 0;
  const candidatesInProcess = resumesData.filter(r => r.status === 'screening').length;
  const interviewsScheduled = resumesData.filter(r => r.status === 'scheduled').length;
  
  // Update dashboard display
  setStats(calculatedMetrics);
};
```

**Real-time Updates:**
- Statistics refresh automatically when data changes
- Charts update based on current time periods
- Performance metrics calculate trends and percentages

---

## Jobs Management System

### Job Assignment Logic

**Assignment Process:**
1. Managers/Admins create job postings
2. Jobs are assigned to specific recruiters
3. Recruiters see only their assigned jobs
4. System tracks job status and deadlines

**Job Status Categories:**
- **Opened**: Active jobs within deadline
- **Urgent**: High-priority positions requiring immediate attention
- **Closed**: Completed or expired positions

### Job Filtering and Search

**Filter Implementation:**
```javascript
const filterJobs = (jobs, activeFilter) => {
  switch (activeFilter) {
    case 'opened':
      return jobs.filter(job => !job.isClosed && !isDeadlinePassed(job));
    case 'urgent':
      return jobs.filter(job => job.priority.includes('High') && !job.isClosed);
    case 'closed':
      return jobs.filter(job => job.isClosed || isDeadlinePassed(job));
    default:
      return jobs;
  }
};
```

**Pagination System:**
- 10 jobs per page
- Navigation controls for large job lists
- Real-time count updates

### Job Details Management

**Information Display:**
- Job title, company, location
- Salary range and experience requirements
- Key responsibilities and required skills
- Application statistics and progress tracking

---

## ZepDB - AI-Powered Database

### Natural Language Processing

**Query Processing Flow:**
1. **User Input**: Recruiter types natural language query
2. **AI Analysis**: Gemini AI processes the query
3. **Parameter Extraction**: System identifies search criteria
4. **Database Search**: Matches criteria against candidate database
5. **Results Display**: Shows relevant candidates with status

**Example Queries:**
- "Find React developers with 3+ years experience"
- "Show me candidates with Python and Django skills"
- "Give me resumes for senior software engineers"

### Candidate Matching Algorithm

**Search Logic:**
```javascript
const processQuery = async (userQuery) => {
  // Extract key information using AI
  const extractedInfo = await extractQueryInfo(userQuery);
  
  // Search database with extracted parameters
  const candidates = await fetchCandidates(extractedInfo);
  
  // Filter and rank results
  const rankedCandidates = rankCandidates(candidates, extractedInfo);
  
  return rankedCandidates;
};
```

### Candidate Status Management

**Status Categories:**
- **Screening**: Initial evaluation phase
- **Scheduled**: Interview arranged
- **Submitted**: Sent to manager for review
- **Shortlisted**: Approved for next round
- **Rejected**: Not selected
- **Offered**: Job offer extended
- **Hired**: Successfully placed

**Status Transition Logic:**
- Automatic status updates based on actions
- Manual status changes by recruiters
- Audit trail for all status changes

---

## Job Detail Page Functionality

### Page Structure

**Main Components:**
1. **Job Information Panel**
   - Complete job description
   - Requirements and responsibilities
   - Company and location details
   - Salary and experience information

2. **Resume Upload Section**
   - Drag-and-drop file upload
   - Support for PDF and DOCX formats
   - Real-time processing status

3. **Saved Resumes List**
   - All resumes submitted for the job
   - Status tracking for each candidate
   - Quick access to candidate details

4. **Analytics Dashboard**
   - Application statistics
   - Progress tracking charts
   - Performance metrics

### Resume Upload Process

**File Processing Flow:**
```javascript
const processResume = async (file) => {
  // Extract text from PDF/DOCX
  const text = await extractTextFromFile(file);
  
  // Analyze resume with AI
  const analysis = await analyzeResume(text, jobDetails);
  
  // Calculate ATS score
  const atsResult = await fetchATSScore(text);
  
  // Save to database
  const saved = await saveResumeToDB(analysis, jobId);
  
  return saved;
};
```

**Supported Formats:**
- PDF files (primary format)
- DOCX files (Microsoft Word documents)
- Automatic text extraction and processing

---

## Resume Processing & Interview System

### AI-Powered Resume Analysis

**Analysis Components:**
1. **Text Extraction**: Convert PDF/DOCX to searchable text
2. **Skill Identification**: AI identifies relevant technical skills
3. **Experience Assessment**: Evaluate work history and duration
4. **ATS Scoring**: Calculate applicant tracking system compatibility
5. **Category Classification**: Assign resume to appropriate job categories

**ATS Score Calculation:**
```javascript
const calculateATSScore = (resumeText, jobRequirements) => {
  // Analyze keyword matches
  const keywordScore = analyzeKeywords(resumeText, jobRequirements);
  
  // Evaluate formatting and structure
  const formatScore = evaluateFormatting(resumeText);
  
  // Calculate overall score
  const overallScore = (keywordScore * 0.7) + (formatScore * 0.3);
  
  return {
    ats_score: overallScore,
    ats_reason: generateScoreExplanation(overallScore),
    ats_breakdown: detailedBreakdown
  };
};
```

### Interview Question Generation

**AI Question Generation Process:**
1. **Skill Analysis**: Extract top 5 relevant skills from resume
2. **Question Creation**: Generate questions based on skills and job role
3. **Question Types**: Technical, practical, and challenge questions
4. **Customization**: Recruiters can add manual questions

**Question Categories:**
- **Technical Questions**: Evaluate specific technical knowledge
- **Practical Questions**: Assess problem-solving abilities
- **Challenge Questions**: Test real-world application skills

### Answer Evaluation System

**Evaluation Criteria:**
```javascript
const evaluateAnswer = async (answer, questionType) => {
  const evaluationPrompt = `
    Evaluate this response for a ${questionType} question:
    Response: "${answer}"
    
    Provide scores for:
    - Technical accuracy: 0-100
    - Clarity of explanation: 0-100
    - Practical relevance: 0-100
    - Overall assessment: 0-100
  `;
  
  const evaluation = await aiModel.generateContent(evaluationPrompt);
  return parseEvaluation(evaluation);
};
```

**Scoring Breakdown:**
- **Technical Questions**: Terminology (20%), Process explanation (30%), Tool usage (30%), Logical flow (20%)
- **Practical Questions**: Problem solution clarity (40%), Job relevance (30%), Outcomes shared (30%)
- **Challenge Questions**: Explanation depth (40%), Real-world applicability (30%), Confidence (30%)

### Final Assessment Process

**Score Calculation:**
1. **Individual Question Scores**: Each answer evaluated separately
2. **Skill-Specific Scoring**: Skills rated based on relevant answers
3. **Overall Assessment**: Weighted average of all scores
4. **Recommendation Generation**: AI provides hiring recommendation

**Decision Options:**
- **Submit to Manager**: Approve candidate for next round
- **Request Another Round**: Schedule additional interviews
- **Reject**: Decline candidate

---

## Scorecard System - Comprehensive Analysis

### What is a Scorecard? (Simple Explanation)

Think of a scorecard like a report card for job candidates. Just like how teachers grade students on different subjects, our system grades candidates on different skills and qualities needed for the job. The scorecard helps recruiters make fair and informed decisions about whether to hire someone.

**In Simple Terms:**
- **Scorecard** = A detailed report that shows how well a candidate matches the job
- **ATS Score** = How well the resume is written (like checking if an essay follows proper format)
- **AI Summary** = A smart computer that reads the resume and tells you the key points
- **Strengths & Weaknesses** = What the candidate is good at and what they need to improve
- **Overall Score** = The final grade that helps decide if they should get the job

### Scorecard Generation Logic

**Core Components:**
1. **ATS Score Calculation**: Automated tracking system compatibility
2. **AI Resume Summary**: Intelligent resume analysis and summary
3. **AI Scorecard**: Comprehensive candidate evaluation
4. **Strength & Weakness Analysis**: Detailed skill assessment
5. **Application Details**: Complete candidate information tracking

### ATS Score Calculation Logic

**Algorithm Implementation:**
```javascript
const calculateATSScore = async (resumeText, jobRequirements) => {
  // Step 1: Keyword Matching Analysis
  const keywordMatches = await analyzeKeywordMatches(resumeText, jobRequirements);
  
  // Step 2: Format and Structure Evaluation
  const formatScore = evaluateResumeFormat(resumeText);
  
  // Step 3: Content Relevance Assessment
  const contentRelevance = assessContentRelevance(resumeText, jobRequirements);
  
  // Step 4: Experience Alignment Check
  const experienceAlignment = checkExperienceAlignment(resumeText, jobRequirements);
  
  // Step 5: Skills Verification
  const skillsVerification = verifySkills(resumeText, jobRequirements.skills);
  
  // Calculate weighted ATS score
  const atsScore = (
    (keywordMatches * 0.25) +
    (formatScore * 0.20) +
    (contentRelevance * 0.25) +
    (experienceAlignment * 0.20) +
    (skillsVerification * 0.10)
  );
  
  return {
    ats_score: Math.round(atsScore),
    ats_reason: generateATSScoreExplanation(atsScore),
    ats_breakdown: {
      keyword_matches: keywordMatches,
      format_score: formatScore,
      content_relevance: contentRelevance,
      experience_alignment: experienceAlignment,
      skills_verification: skillsVerification
    }
  };
};
```

**Scoring Criteria:**
- **Keyword Matching (25%)**: Relevance of resume keywords to job requirements
- **Format Score (20%)**: Resume structure, readability, and professional presentation
- **Content Relevance (25%)**: Overall alignment with job description
- **Experience Alignment (20%)**: Match between candidate experience and job requirements
- **Skills Verification (10%)**: Verification of claimed skills against job needs

**In Simple Terms - How ATS Scoring Works:**
Imagine you're checking if someone's resume is good enough for a job. The system looks at 5 things:

1. **Keywords (25%)**: Does the resume mention the right words? Like if the job needs "Python programming," does the resume say "Python"?
2. **Format (20%)**: Is the resume neat and easy to read? Like checking if an essay has proper paragraphs and spelling.
3. **Content (25%)**: Does the resume actually match what the job is looking for? Like making sure a chef's resume talks about cooking, not accounting.
4. **Experience (20%)**: Does the person have the right kind of work history? Like checking if someone applying for a senior position has enough years of experience.
5. **Skills (10%)**: Can we verify the skills they claim to have? Like making sure someone who says they know "JavaScript" actually mentions it in their work experience.

### AI Resume Summary Logic

**Summary Generation Process:**
```javascript
const generateResumeSummary = async (resumeText, jobDetails) => {
  const summaryPrompt = `
    Analyze this resume for a ${jobDetails.jobtitle} position at ${jobDetails.company}:
    
    Resume: ${resumeText}
    Job Requirements: ${jobDetails.requirements}
    
    Provide a comprehensive summary including:
    1. Professional Summary (2-3 sentences)
    2. Key Skills Identified
    3. Relevant Experience Highlights
    4. Education and Certifications
    5. Notable Achievements
    6. Overall Fit Assessment
  `;
  
  const aiResponse = await geminiAI.generateContent(summaryPrompt);
  return parseResumeSummary(aiResponse);
};
```

**Summary Components:**
1. **Professional Summary**: AI-generated overview of candidate's profile
2. **Key Skills**: Extracted technical and soft skills
3. **Experience Highlights**: Most relevant work experience
4. **Education**: Academic background and certifications
5. **Achievements**: Notable accomplishments and projects
6. **Fit Assessment**: Overall suitability for the position

**In Simple Terms - How AI Summary Works:**
Think of this like having a smart assistant who reads a long resume and gives you a quick summary. It's like asking someone to read a 10-page book and tell you the main points in 2 minutes.

**What the AI Does:**
- **Reads the resume** like a human would, but much faster
- **Picks out the important stuff** - like what skills they have, where they worked, what they studied
- **Writes a short summary** that tells you the key points without having to read the whole resume
- **Gives an opinion** on whether this person seems like a good fit for the job

**Example:** Instead of reading a 3-page resume, the AI might tell you: "This person has 5 years of experience in web development, knows JavaScript and React, worked at Google for 2 years, and seems like a good match for our frontend developer position."

### AI Scorecard Logic

**Comprehensive Evaluation System:**
```javascript
const generateAIScorecard = async (resumeData, interviewData, jobRequirements) => {
  // Technical Skills Assessment
  const technicalScore = await assessTechnicalSkills(resumeData, interviewData);
  
  // Experience Evaluation
  const experienceScore = await evaluateExperience(resumeData, jobRequirements);
  
  // Communication Skills
  const communicationScore = await assessCommunication(interviewData);
  
  // Problem-Solving Ability
  const problemSolvingScore = await evaluateProblemSolving(interviewData);
  
  // Cultural Fit Assessment
  const culturalFitScore = await assessCulturalFit(interviewData, resumeData);
  
  // Overall Score Calculation
  const overallScore = calculateWeightedScore({
    technical: technicalScore,
    experience: experienceScore,
    communication: communicationScore,
    problemSolving: problemSolvingScore,
    culturalFit: culturalFitScore
  });
  
  return {
    overall_score: overallScore,
    category_scores: {
      technical: technicalScore,
      experience: experienceScore,
      communication: communicationScore,
      problem_solving: problemSolvingScore,
      cultural_fit: culturalFitScore
    },
    recommendation: generateRecommendation(overallScore),
    detailed_analysis: generateDetailedAnalysis(resumeData, interviewData)
  };
};
```

**Scorecard Categories:**
- **Technical Skills (30%)**: Programming languages, tools, frameworks
- **Experience (25%)**: Relevant work history and project experience
- **Communication (20%)**: Verbal and written communication abilities
- **Problem-Solving (15%)**: Analytical thinking and solution approach
- **Cultural Fit (10%)**: Alignment with company culture and values

**In Simple Terms - How AI Scorecard Works:**
Think of this like a job interview where you grade someone on different areas. Instead of just one overall score, you give them separate grades for different skills, just like how a student might get A in Math, B in English, and C in Science.

**How the Grading Works:**
1. **Technical Skills (30%)**: Can they do the actual work? Like if it's a programming job, do they know how to code?
2. **Experience (25%)**: Have they done similar work before? Like if you're hiring a chef, have they worked in restaurants?
3. **Communication (20%)**: Can they explain things clearly? Like can they tell you how they solved a problem?
4. **Problem-Solving (15%)**: Can they figure things out when something goes wrong? Like if a computer breaks, can they fix it?
5. **Cultural Fit (10%)**: Will they get along with the team? Like do they share the same work values and style?

**Example Score:** Someone might get 85% in technical skills, 90% in experience, 75% in communication, 80% in problem-solving, and 85% in cultural fit, giving them an overall score of 83%.

### Strength & Weakness Analysis Logic

**Analysis Algorithm:**
```javascript
const analyzeStrengthsWeaknesses = async (resumeData, interviewData, jobRequirements) => {
  // Extract candidate skills and experiences
  const candidateSkills = extractSkills(resumeData);
  const candidateExperience = extractExperience(resumeData);
  
  // Compare with job requirements
  const skillGaps = identifySkillGaps(candidateSkills, jobRequirements.skills);
  const experienceGaps = identifyExperienceGaps(candidateExperience, jobRequirements);
  
  // Analyze interview performance
  const interviewStrengths = extractInterviewStrengths(interviewData);
  const interviewWeaknesses = extractInterviewWeaknesses(interviewData);
  
  // Generate strengths
  const strengths = [
    ...candidateSkills.filter(skill => jobRequirements.skills.includes(skill)),
    ...interviewStrengths,
    ...candidateExperience.filter(exp => isRelevant(exp, jobRequirements))
  ];
  
  // Generate weaknesses
  const weaknesses = [
    ...skillGaps,
    ...experienceGaps,
    ...interviewWeaknesses
  ];
  
  return {
    strengths: strengths.slice(0, 5), // Top 5 strengths
    weaknesses: weaknesses.slice(0, 5), // Top 5 areas for improvement
    recommendations: generateImprovementRecommendations(weaknesses)
  };
};
```

**Strength Categories:**
- **Technical Proficiency**: Strong programming skills, tool expertise
- **Relevant Experience**: Direct experience in similar roles/projects
- **Communication Skills**: Clear expression and articulation
- **Problem-Solving**: Analytical approach and solution methodology
- **Leadership**: Team management and project leadership experience

**Weakness Categories:**
- **Skill Gaps**: Missing technical skills required for the role
- **Experience Shortfalls**: Insufficient relevant work experience
- **Communication Issues**: Difficulty in expressing ideas clearly
- **Technical Depth**: Lack of deep technical knowledge
- **Cultural Misalignment**: Potential cultural fit concerns

**In Simple Terms - How Strengths & Weaknesses Analysis Works:**
Think of this like a coach analyzing a player's performance. The coach watches the player and says "You're really good at shooting, but you need to work on your defense." Our system does the same thing for job candidates.

**What the System Looks For:**

**Strengths (What They're Good At):**
- **Technical Skills**: "This person really knows their programming languages"
- **Experience**: "They've worked on similar projects before"
- **Communication**: "They can explain complex ideas clearly"
- **Problem-Solving**: "They think logically and find good solutions"
- **Leadership**: "They can guide a team and take charge when needed"

**Weaknesses (What They Need to Improve):**
- **Missing Skills**: "They don't know the specific tool we use"
- **Not Enough Experience**: "They've only worked on small projects, we need someone for bigger ones"
- **Communication Issues**: "They have trouble explaining their ideas clearly"
- **Shallow Knowledge**: "They know the basics but not the advanced stuff"
- **Team Fit**: "They might not work well with our team's style"

**Example:** "This candidate is excellent at Python programming and has great problem-solving skills, but they lack experience with cloud computing and sometimes struggle to explain technical concepts to non-technical people."

### Application Details Logic

**Information Tracking System:**
```javascript
const trackApplicationDetails = async (candidateId, jobId) => {
  const applicationData = {
    candidate_info: await getCandidateInfo(candidateId),
    job_details: await getJobDetails(jobId),
    application_timeline: await getApplicationTimeline(candidateId, jobId),
    evaluation_history: await getEvaluationHistory(candidateId, jobId),
    status_updates: await getStatusUpdates(candidateId, jobId),
    communication_log: await getCommunicationLog(candidateId, jobId)
  };
  
  return applicationData;
};
```

**Application Tracking Components:**
1. **Candidate Information**: Personal details, contact information, current status
2. **Job Details**: Position requirements, company information, salary range
3. **Application Timeline**: Submission date, review dates, status changes
4. **Evaluation History**: All assessments, scores, and feedback
5. **Status Updates**: Current stage in the hiring process
6. **Communication Log**: All interactions and correspondence

**In Simple Terms - How Application Tracking Works:**
Think of this like keeping a detailed diary for each job application. It's like having a file folder for each candidate where you keep track of everything that happens with their application.

**What Gets Tracked:**
- **Who they are**: Name, phone, email, where they live
- **What job they want**: Position title, salary, what the job involves
- **When things happen**: When they applied, when you reviewed them, when you interviewed them
- **How they did**: All their scores, feedback, and evaluations
- **Where they are now**: Are they still being considered, rejected, or hired?
- **What you talked about**: All emails, calls, and messages with them

**Example:** "John Smith applied for the Software Engineer position on March 1st. We reviewed his resume on March 2nd and gave him an ATS score of 85%. We interviewed him on March 5th and he scored 78% overall. We submitted him to the manager on March 6th. The manager approved him on March 8th and he's now shortlisted for the final round."

### AI Questions Generation & Scheduling Logic

**Question Generation Process:**
```javascript
const generateAIQuestions = async (resumeData, jobRequirements) => {
  // Extract top skills from resume
  const topSkills = extractTopSkills(resumeData, 5);
  
  // Generate questions for each skill
  const skillQuestions = await Promise.all(
    topSkills.map(skill => generateSkillQuestions(skill, jobRequirements))
  );
  
  // Generate behavioral questions
  const behavioralQuestions = await generateBehavioralQuestions(jobRequirements);
  
  // Generate technical scenario questions
  const scenarioQuestions = await generateScenarioQuestions(jobRequirements);
  
  return {
    technical_questions: skillQuestions.flat(),
    behavioral_questions: behavioralQuestions,
    scenario_questions: scenarioQuestions,
    total_questions: skillQuestions.flat().length + behavioralQuestions.length + scenarioQuestions.length
  };
};
```

**Question Types:**
- **Technical Questions**: Specific skill-based questions
- **Behavioral Questions**: Past experience and situation handling
- **Scenario Questions**: Real-world problem-solving scenarios
- **Custom Questions**: Recruiter-added specific questions

**In Simple Terms - How AI Question Generation Works:**
Think of this like having a smart assistant who helps you prepare for an interview. Instead of you having to think of all the questions yourself, the AI looks at the candidate's resume and the job requirements, then suggests good questions to ask.

**What the AI Does:**
1. **Reads the resume** and picks out the most important skills
2. **Looks at the job requirements** to understand what the company needs
3. **Creates different types of questions** to test different aspects of the candidate
4. **Suggests when to schedule the interview** based on availability

**Types of Questions the AI Creates:**

**Technical Questions**: "Can you explain how you would build a website using React?"
**Why:** To see if they actually know the technical skills they claim to have

**Behavioral Questions**: "Tell me about a time when you had to solve a difficult problem at work?"
**Why:** To see how they handle real situations and work with others

**Scenario Questions**: "What would you do if a client wanted to change the project requirements at the last minute?"
**Why:** To see how they think and make decisions under pressure

**Example:** For a Python developer position, the AI might create questions like:
- "How would you optimize a slow database query?"
- "Tell me about a time you had to work with a difficult team member"
- "What would you do if your code broke in production?"

**Scheduling Logic:**
```javascript
const scheduleInterview = async (candidateId, jobId, questions) => {
  // Check candidate availability
  const availability = await getCandidateAvailability(candidateId);
  
  // Check recruiter availability
  const recruiterAvailability = await getRecruiterAvailability();
  
  // Find common time slots
  const commonSlots = findCommonTimeSlots(availability, recruiterAvailability);
  
  // Schedule interview
  const scheduledInterview = await createInterview({
    candidateId,
    jobId,
    questions,
    scheduledTime: commonSlots[0],
    duration: 60, // minutes
    type: 'technical_interview'
  });
  
  return scheduledInterview;
};
```

### Transcript Management Logic

**Transcript Processing:**
```javascript
const processTranscript = async (interviewId, audioFile) => {
  // Convert audio to text using speech-to-text API
  const transcriptText = await convertAudioToText(audioFile);
  
  // Segment transcript by questions
  const segmentedTranscript = segmentByQuestions(transcriptText);
  
  // Match answers to questions
  const matchedAnswers = matchAnswersToQuestions(segmentedTranscript, questions);
  
  // Save transcript to database
  const savedTranscript = await saveTranscript({
    interviewId,
    transcriptText,
    segmentedAnswers: matchedAnswers,
    processingStatus: 'completed'
  });
  
  return savedTranscript;
};
```

**Answer Evaluation Logic:**
```javascript
const evaluateTranscriptAnswers = async (transcriptData, questions) => {
  const evaluations = await Promise.all(
    transcriptData.segmentedAnswers.map(async (answer, index) => {
      const question = questions[index];
      
      // Evaluate based on question type
      const evaluation = await evaluateAnswerByType(answer, question);
      
      return {
        questionId: question.id,
        answer: answer.text,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses
      };
    })
  );
  
  // Calculate overall score
  const overallScore = calculateOverallScore(evaluations);
  
  return {
    individualEvaluations: evaluations,
    overallScore: overallScore,
    recommendation: generateRecommendation(overallScore)
  };
};
```

**Scoring Criteria for Answers:**
- **Technical Accuracy (40%)**: Correctness of technical information
- **Clarity of Explanation (30%)**: How well the answer is communicated
- **Relevance to Question (20%)**: Directness of response to the question
- **Confidence Level (10%)**: Assurance and conviction in the answer

**In Simple Terms - How Answer Evaluation Works:**
Think of this like grading a student's essay. You don't just give one grade - you look at different aspects like "Did they answer the question correctly?", "Did they explain it clearly?", "Did they stay on topic?"

**How the AI Grades Answers:**

**Technical Accuracy (40%)**: "Did they give the right technical information?"
- **Example:** If asked about Python, did they mention the correct syntax and concepts?
- **Why 40%:** This is the most important - they need to know their stuff!

**Clarity of Explanation (30%)**: "Could someone else understand what they're saying?"
- **Example:** Did they explain complex ideas in simple terms?
- **Why 30%:** Even if they know the answer, they need to be able to explain it to others

**Relevance to Question (20%)**: "Did they actually answer what was asked?"
- **Example:** If asked about database optimization, did they talk about databases or something else?
- **Why 20%:** They need to stay focused on the question

**Confidence Level (10%)**: "Do they sound sure about their answer?"
- **Example:** Did they speak with confidence or did they seem unsure?
- **Why 10%:** Confidence shows they really know what they're talking about

**Example Scoring:** Someone might get:
- Technical Accuracy: 85% (they knew the right technical details)
- Clarity: 70% (they explained it okay but could be clearer)
- Relevance: 90% (they stayed on topic)
- Confidence: 80% (they sounded sure of themselves)
- **Overall Score: 82%**

### Manager Referral Logic

**Referral Process:**
```javascript
const referToManager = async (candidateId, jobId, scorecardData) => {
  // Validate candidate eligibility for referral
  const eligibility = await validateReferralEligibility(candidateId, jobId);
  
  if (!eligibility.isEligible) {
    throw new Error(eligibility.reason);
  }
  
  // Prepare referral package
  const referralPackage = {
    candidateId,
    jobId,
    scorecard: scorecardData,
    recruiterRecommendation: generateRecruiterRecommendation(scorecardData),
    supportingDocuments: await gatherSupportingDocuments(candidateId, jobId),
    timeline: await getApplicationTimeline(candidateId, jobId)
  };
  
  // Submit to manager
  const referral = await submitToManager(referralPackage);
  
  // Update candidate status
  await updateCandidateStatus(candidateId, jobId, 'submitted_to_manager');
  
  // Send notification to manager
  await notifyManager(referral);
  
  return referral;
};
```

**Referral Requirements:**
- Minimum overall score threshold (typically 70%+)
- Complete evaluation data
- All required documents uploaded
- Interview transcript available
- Recruiter recommendation provided

**In Simple Terms - How Manager Referral Works:**
Think of this like a teacher recommending a student to the principal. The teacher doesn't just send any student - they only send the ones who meet certain standards and have all the required paperwork.

**What Happens When You Refer to Manager:**

**Step 1: Check if they qualify**
- Did they get a good enough score? (usually 70% or higher)
- Do we have all their information?
- Did they complete the interview?
- Do we have all the documents we need?

**Step 2: Prepare the recommendation package**
- Put together all their scores and evaluations
- Include the resume and interview transcript
- Write a summary of why we think they're good for the job
- Add any notes or concerns

**Step 3: Send to the manager**
- Submit everything to the manager for review
- Update the candidate's status to "submitted to manager"
- Send a notification to the manager

**Step 4: Wait for manager's decision**
- Manager reviews all the information
- Manager decides: approve, reject, or ask for more information
- System updates the candidate's status based on manager's decision

**Example:** "John scored 78% overall, completed his interview, and we have all his documents. We're recommending him to the manager because he has strong technical skills and good communication. The manager will review everything and decide if he should move to the next round."

---

## Candidate Lifecycle Management

### What is Candidate Lifecycle? (Simple Explanation)

Think of the candidate lifecycle like a journey that every job applicant goes through. It's like a pipeline where candidates move from one stage to the next, just like how water flows through pipes. Each stage has specific requirements and actions that need to happen before the candidate can move forward.

**In Simple Terms:**
- **Lifecycle** = The complete journey from when someone applies to when they get hired (or rejected)
- **Pipeline** = A series of steps that candidates must go through
- **Stages** = Different phases of the hiring process
- **Status** = Where the candidate currently is in the process

### Complete Candidate Journey

**Lifecycle Stages:**
1. **Submitted** → Initial resume upload and processing
2. **Screening** → AI analysis and initial evaluation
3. **Interview Scheduled** → Interview arrangement and preparation
4. **Interview Completed** → Interview conduction and transcript processing
5. **Evaluation** → Scorecard generation and assessment
6. **Submitted to Manager** → Manager review and approval
7. **Shortlisted** → Approved for next round
8. **Final Interview** → Additional rounds if required
9. **Offered** → Job offer extended
10. **Hired** → Successful placement
11. **Rejected** → Candidate not selected

**In Simple Terms - The Candidate Journey:**

Think of this like a job application going through different checkpoints, like going through security at an airport. You can't skip steps - you have to go through each one in order.

**The Journey Explained:**

**Stage 1: Submitted** 
- "Someone uploaded their resume"
- Like putting your name on a waiting list

**Stage 2: Screening**
- "The computer is checking if their resume is good enough"
- Like a first filter to see if they meet basic requirements

**Stage 3: Interview Scheduled**
- "We're setting up a time to talk to them"
- Like making an appointment

**Stage 4: Interview Completed**
- "We finished talking to them and recorded what they said"
- Like finishing a meeting and taking notes

**Stage 5: Evaluation**
- "We're grading how well they did in the interview"
- Like scoring a test

**Stage 6: Submitted to Manager**
- "We're sending the good candidates to our boss for approval"
- Like asking permission to move forward

**Stage 7: Shortlisted**
- "The boss approved them for the next round"
- Like making it to the finals

**Stage 8: Final Interview**
- "They're doing one more interview with senior people"
- Like a final exam

**Stage 9: Offered**
- "We're offering them the job"
- Like extending an invitation

**Stage 10: Hired**
- "They accepted the job and are now our employee"
- Like officially joining the team

**Stage 11: Rejected**
- "We decided not to hire them"
- Like not making the cut

**Example Journey:** "John applied on Monday, we screened him on Tuesday, interviewed him on Wednesday, evaluated him on Thursday, sent him to the manager on Friday, and he was shortlisted by Monday. He had his final interview on Wednesday and got the job offer on Friday!"

### Stage Transition Logic

**Status Management System:**
```javascript
const updateCandidateStatus = async (candidateId, jobId, newStatus, metadata = {}) => {
  // Validate status transition
  const currentStatus = await getCurrentStatus(candidateId, jobId);
  const validTransitions = getValidTransitions(currentStatus);
  
  if (!validTransitions.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }
  
  // Update status in database
  const updatedStatus = await updateStatus(candidateId, jobId, newStatus);
  
  // Log status change
  await logStatusChange({
    candidateId,
    jobId,
    previousStatus: currentStatus,
    newStatus: newStatus,
    timestamp: new Date(),
    metadata: metadata
  });
  
  // Trigger status-specific actions
  await triggerStatusActions(newStatus, candidateId, jobId, metadata);
  
  return updatedStatus;
};
```

**Valid Status Transitions:**
```javascript
const statusTransitions = {
  'submitted': ['screening', 'rejected'],
  'screening': ['interview_scheduled', 'rejected'],
  'interview_scheduled': ['interview_completed', 'interview_cancelled'],
  'interview_completed': ['evaluation', 'rejected'],
  'evaluation': ['submitted_to_manager', 'request_another_round', 'rejected'],
  'submitted_to_manager': ['shortlisted', 'rejected'],
  'shortlisted': ['final_interview', 'offered', 'rejected'],
  'final_interview': ['offered', 'rejected'],
  'offered': ['hired', 'offer_declined'],
  'hired': [], // Terminal state
  'rejected': [], // Terminal state
  'offer_declined': [] // Terminal state
};
```

**In Simple Terms - How Status Changes Work:**

Think of this like a board game where you can only move to certain squares. You can't jump from the start directly to the finish - you have to follow the rules and go through each step in order.

**The Rules of Moving Forward:**

**From "Submitted" you can go to:**
- **Screening** (if their resume looks okay)
- **Rejected** (if their resume is clearly not suitable)

**From "Screening" you can go to:**
- **Interview Scheduled** (if they pass the initial check)
- **Rejected** (if they don't meet the basic requirements)

**From "Interview Scheduled" you can go to:**
- **Interview Completed** (if the interview happened)
- **Interview Cancelled** (if something went wrong)

**From "Interview Completed" you can go to:**
- **Evaluation** (if the interview went well)
- **Rejected** (if the interview revealed major problems)

**From "Evaluation" you can go to:**
- **Submitted to Manager** (if they scored well enough)
- **Request Another Round** (if they're borderline and need another interview)
- **Rejected** (if they scored too low)

**From "Submitted to Manager" you can go to:**
- **Shortlisted** (if the manager approves)
- **Rejected** (if the manager says no)

**From "Shortlisted" you can go to:**
- **Final Interview** (if they need one more round)
- **Offered** (if they're ready for a job offer)
- **Rejected** (if something changed)

**From "Final Interview" you can go to:**
- **Offered** (if they did well)
- **Rejected** (if they didn't meet expectations)

**From "Offered" you can go to:**
- **Hired** (if they accept the job)
- **Offer Declined** (if they say no)

**Final States (you can't go anywhere else from here):**
- **Hired** (they got the job!)
- **Rejected** (they didn't get the job)
- **Offer Declined** (they turned down the job)

**Example:** "John was in 'Evaluation' stage. He scored 75%, so he moved to 'Submitted to Manager'. The manager approved him, so he moved to 'Shortlisted'. He had his final interview and did great, so he moved to 'Offered'. He accepted the job, so he's now 'Hired'!"

### Submitted Stage Logic

**Initial Processing:**
```javascript
const processSubmittedCandidate = async (candidateId, jobId, resumeFile) => {
  // Extract text from resume
  const resumeText = await extractResumeText(resumeFile);
  
  // Perform initial AI analysis
  const initialAnalysis = await performInitialAnalysis(resumeText, jobId);
  
  // Calculate ATS score
  const atsScore = await calculateATSScore(resumeText, jobId);
  
  // Determine if candidate passes initial screening
  const passesScreening = atsScore.ats_score >= MINIMUM_ATS_SCORE;
  
  // Update status based on screening result
  const newStatus = passesScreening ? 'screening' : 'rejected';
  
  await updateCandidateStatus(candidateId, jobId, newStatus, {
    atsScore: atsScore,
    initialAnalysis: initialAnalysis,
    screeningResult: passesScreening
  });
  
  return {
    status: newStatus,
    atsScore: atsScore,
    analysis: initialAnalysis
  };
};
```

### Screening Stage Logic

**Comprehensive Evaluation:**
```javascript
const performScreeningEvaluation = async (candidateId, jobId) => {
  // Get candidate data
  const candidateData = await getCandidateData(candidateId, jobId);
  
  // Perform detailed AI analysis
  const detailedAnalysis = await performDetailedAnalysis(candidateData);
  
  // Generate AI questions for interview
  const aiQuestions = await generateAIQuestions(candidateData.resume, candidateData.job);
  
  // Assess candidate suitability
  const suitabilityAssessment = await assessSuitability(candidateData, detailedAnalysis);
  
  // Determine next stage
  const nextStage = determineNextStage(suitabilityAssessment);
  
  // Update status
  await updateCandidateStatus(candidateId, jobId, nextStage, {
    detailedAnalysis: detailedAnalysis,
    aiQuestions: aiQuestions,
    suitabilityAssessment: suitabilityAssessment
  });
  
  return {
    nextStage: nextStage,
    analysis: detailedAnalysis,
    questions: aiQuestions
  };
};
```

### Interview Scheduling Logic

**Scheduling Process:**
```javascript
const scheduleInterviewProcess = async (candidateId, jobId) => {
  // Get generated questions
  const questions = await getGeneratedQuestions(candidateId, jobId);
  
  // Check availability
  const availability = await checkAvailability(candidateId, jobId);
  
  // Schedule interview
  const interviewSchedule = await scheduleInterview(candidateId, jobId, questions, availability);
  
  // Send notifications
  await sendInterviewNotifications(interviewSchedule);
  
  // Update status
  await updateCandidateStatus(candidateId, jobId, 'interview_scheduled', {
    interviewSchedule: interviewSchedule,
    questions: questions
  });
  
  return interviewSchedule;
};
```

### Interview Completion Logic

**Post-Interview Processing:**
```javascript
const completeInterviewProcess = async (interviewId) => {
  // Get interview data
  const interviewData = await getInterviewData(interviewId);
  
  // Process transcript if available
  if (interviewData.transcript) {
    const transcriptAnalysis = await processTranscript(interviewData.transcript);
    const answerEvaluations = await evaluateAnswers(transcriptAnalysis, interviewData.questions);
    
    // Generate comprehensive scorecard
    const scorecard = await generateScorecard(interviewData, answerEvaluations);
    
    // Update candidate status
    await updateCandidateStatus(
      interviewData.candidateId, 
      interviewData.jobId, 
      'evaluation', 
      {
        scorecard: scorecard,
        transcriptAnalysis: transcriptAnalysis,
        answerEvaluations: answerEvaluations
      }
    );
    
    return scorecard;
  }
  
  // Manual evaluation if no transcript
  const manualEvaluation = await performManualEvaluation(interviewData);
  
  await updateCandidateStatus(
    interviewData.candidateId, 
    interviewData.jobId, 
    'evaluation', 
    { manualEvaluation: manualEvaluation }
  );
  
  return manualEvaluation;
};
```

### Evaluation Stage Logic

**Scorecard Generation and Decision:**
```javascript
const performEvaluation = async (candidateId, jobId) => {
  // Get all evaluation data
  const evaluationData = await getEvaluationData(candidateId, jobId);
  
  // Generate final scorecard
  const finalScorecard = await generateFinalScorecard(evaluationData);
  
  // Determine recommendation
  const recommendation = await generateRecommendation(finalScorecard);
  
  // Make decision based on score and recommendation
  const decision = makeDecision(finalScorecard, recommendation);
  
  // Update status based on decision
  await updateCandidateStatus(candidateId, jobId, decision.status, {
    finalScorecard: finalScorecard,
    recommendation: recommendation,
    decision: decision
  });
  
  return {
    scorecard: finalScorecard,
    recommendation: recommendation,
    decision: decision
  };
};
```

**Decision Logic:**
```javascript
const makeDecision = (scorecard, recommendation) => {
  const overallScore = scorecard.overall_score;
  
  if (overallScore >= 85) {
    return {
      status: 'submitted_to_manager',
      reason: 'High score - Ready for manager review',
      priority: 'high'
    };
  } else if (overallScore >= 70) {
    return {
      status: 'submitted_to_manager',
      reason: 'Good score - Submit for manager review',
      priority: 'medium'
    };
  } else if (overallScore >= 60) {
    return {
      status: 'request_another_round',
      reason: 'Borderline score - Additional interview recommended',
      priority: 'low'
    };
  } else {
    return {
      status: 'rejected',
      reason: 'Below threshold - Not suitable for position',
      priority: 'none'
    };
  }
};
```

**In Simple Terms - How Decision Making Works:**

Think of this like grading a test and deciding what happens next. If someone gets an A, they pass easily. If they get a C, they might need extra help. If they get an F, they fail.

**The Decision Rules:**

**Score 85% or higher (A Grade):**
- **Action:** Send to manager immediately
- **Reason:** "This person is excellent - definitely worth considering"
- **Priority:** High (manager should look at this quickly)

**Score 70-84% (B Grade):**
- **Action:** Send to manager
- **Reason:** "This person is good - worth considering"
- **Priority:** Medium (manager can review when they have time)

**Score 60-69% (C Grade):**
- **Action:** Request another interview
- **Reason:** "This person is borderline - let's give them another chance"
- **Priority:** Low (not urgent, but worth another look)

**Score below 60% (F Grade):**
- **Action:** Reject
- **Reason:** "This person doesn't meet our standards"
- **Priority:** None (no further action needed)

**Example Scenarios:**

**Scenario 1:** John scored 87%
- **Decision:** Send to manager with high priority
- **Why:** He's clearly qualified and ready for the next step

**Scenario 2:** Sarah scored 72%
- **Decision:** Send to manager with medium priority
- **Why:** She's good enough to consider, but not exceptional

**Scenario 3:** Mike scored 65%
- **Decision:** Request another interview
- **Why:** He's close but needs to prove himself more

**Scenario 4:** Lisa scored 45%
- **Decision:** Reject
- **Why:** She doesn't meet the minimum requirements

### Manager Submission Logic

**Submission Process:**
```javascript
const submitToManager = async (candidateId, jobId) => {
  // Validate submission requirements
  const validation = await validateSubmissionRequirements(candidateId, jobId);
  
  if (!validation.isValid) {
    throw new Error(`Submission validation failed: ${validation.reason}`);
  }
  
  // Prepare submission package
  const submissionPackage = await prepareSubmissionPackage(candidateId, jobId);
  
  // Submit to manager
  const submission = await createManagerSubmission(submissionPackage);
  
  // Update status
  await updateCandidateStatus(candidateId, jobId, 'submitted_to_manager', {
    submission: submission,
    submissionDate: new Date()
  });
  
  // Notify manager
  await notifyManager(submission);
  
  return submission;
};
```

### Shortlisting Logic

**Manager Approval Process:**
```javascript
const processManagerDecision = async (submissionId, managerDecision) => {
  const submission = await getSubmission(submissionId);
  
  if (managerDecision.approved) {
    // Update candidate status to shortlisted
    await updateCandidateStatus(
      submission.candidateId, 
      submission.jobId, 
      'shortlisted', 
      {
        managerFeedback: managerDecision.feedback,
        approvalDate: new Date()
      }
    );
    
    // Schedule next round if required
    if (managerDecision.requiresNextRound) {
      await scheduleNextRound(submission.candidateId, submission.jobId);
    }
    
    return { status: 'shortlisted', nextRound: managerDecision.requiresNextRound };
  } else {
    // Reject candidate
    await updateCandidateStatus(
      submission.candidateId, 
      submission.jobId, 
      'rejected', 
      {
        managerFeedback: managerDecision.feedback,
        rejectionDate: new Date()
      }
    );
    
    return { status: 'rejected' };
  }
};
```

### Final Stages Logic

**Offer and Hiring Process:**
```javascript
const processFinalStages = async (candidateId, jobId, stage) => {
  switch (stage) {
    case 'offered':
      return await processJobOffer(candidateId, jobId);
    case 'hired':
      return await processHiring(candidateId, jobId);
    case 'rejected':
      return await processRejection(candidateId, jobId);
    default:
      throw new Error(`Invalid final stage: ${stage}`);
  }
};
```

**Job Offer Process:**
```javascript
const processJobOffer = async (candidateId, jobId) => {
  // Generate offer letter
  const offerLetter = await generateOfferLetter(candidateId, jobId);
  
  // Send offer to candidate
  await sendOfferToCandidate(offerLetter);
  
  // Update status
  await updateCandidateStatus(candidateId, jobId, 'offered', {
    offerLetter: offerLetter,
    offerDate: new Date()
  });
  
  return offerLetter;
};
```

**Hiring Process:**
```javascript
const processHiring = async (candidateId, jobId) => {
  // Process acceptance
  const acceptance = await processOfferAcceptance(candidateId, jobId);
  
  // Update job status
  await updateJobStatus(jobId, 'filled');
  
  // Update candidate status
  await updateCandidateStatus(candidateId, jobId, 'hired', {
    acceptance: acceptance,
    hireDate: new Date()
  });
  
  // Send onboarding information
  await sendOnboardingInfo(candidateId, jobId);
  
  return acceptance;
};
```

### Automated Workflow Triggers

**Status-Based Automation:**
```javascript
const triggerStatusActions = async (status, candidateId, jobId, metadata) => {
  const actionMap = {
    'submitted': () => triggerInitialAnalysis(candidateId, jobId),
    'screening': () => triggerDetailedEvaluation(candidateId, jobId),
    'interview_scheduled': () => triggerInterviewReminders(candidateId, jobId),
    'interview_completed': () => triggerTranscriptProcessing(candidateId, jobId),
    'evaluation': () => triggerScorecardGeneration(candidateId, jobId),
    'submitted_to_manager': () => triggerManagerNotification(candidateId, jobId),
    'shortlisted': () => triggerNextRoundScheduling(candidateId, jobId),
    'offered': () => triggerOfferProcess(candidateId, jobId),
    'hired': () => triggerOnboarding(candidateId, jobId),
    'rejected': () => triggerRejectionNotification(candidateId, jobId)
  };
  
  const action = actionMap[status];
  if (action) {
    await action();
  }
};
```

### Performance Tracking

**Metrics Calculation:**
```javascript
const calculateRecruiterMetrics = async (recruiterId, timePeriod) => {
  const candidates = await getRecruiterCandidates(recruiterId, timePeriod);
  
  const metrics = {
    totalCandidates: candidates.length,
    submittedToManager: candidates.filter(c => c.status === 'submitted_to_manager').length,
    shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
    offered: candidates.filter(c => c.status === 'offered').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
    averageTimeToHire: calculateAverageTimeToHire(candidates),
    conversionRates: calculateConversionRates(candidates),
    qualityScore: calculateQualityScore(candidates)
  };
  
  return metrics;
};
```

---

## Profile & Settings Management

### Account Information Management

**Profile Data Structure:**
```javascript
const profileData = {
  fullname: 'Recruiter Name',
  email: 'recruiter@company.com',
  phone: '+1234567890',
  DOB: '1990-01-01',
  gender: 'Male/Female/Other',
  onboardedBy: 'Manager Name',
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
- Job assignment notifications
- Candidate status updates
- Interview reminders
- System alerts and updates

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

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Google Gemini AI for AI features

**AI Integration:**
- Google Generative AI (Gemini 2.5 Flash)
- Natural language processing
- Resume analysis and scoring
- Interview question generation

### Database Schema

**Recruiter Model:**
```javascript
const recruiterSchema = {
  email: String (unique),
  password: String (encrypted),
  username: String (unique),
  fullname: String,
  DOB: Date,
  gender: Enum ['Male', 'Female', 'Other'],
  phone: String,
  type: String (default: 'recruiter'),
  isActive: Boolean,
  managerId: ObjectId (reference),
  assignedJobs: [ObjectId] (reference),
  performanceMetrics: {
    jobsClosed: Number,
    avgTAT: Number,
    qualityHeatmap: Number,
    redFlags: Number,
    offersMade: Number,
    totalHires: Number
  }
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
  experience: {
    min: Number,
    max: Number
  },
  salary: {
    min: Number,
    max: Number
  },
  location: String,
  assignedTo: [ObjectId] (recruiter references),
  status: String,
  priority: String,
  hiringDeadline: Date
};
```

### API Endpoints

**Recruiter Endpoints:**
- `GET /api/recruiter/assigned-jobs` - Fetch assigned jobs
- `GET /api/recruiter/profile` - Get profile information
- `PUT /api/recruiter/profile` - Update profile
- `PUT /api/recruiter/update-password` - Change password
- `GET /api/recruiter/stats` - Get performance statistics

**Resume Endpoints:**
- `POST /api/resumes/save` - Save processed resume
- `GET /api/resumes/recruiter` - Get recruiter's resumes
- `GET /api/resumes/${id}` - Get specific resume
- `POST /api/resumes/submit-to-manager` - Submit for review

**ZepDB Endpoints:**
- `POST /api/zepdb/query` - Process natural language queries
- `GET /api/zepdb/candidates` - Search candidates

---

## Technical Implementation Details

### Authentication & Authorization

**JWT Token System:**
```javascript
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, type: user.type },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
```

**Middleware Protection:**
- Route-level authentication checks
- Role-based access control
- Token validation on each request

### Error Handling

**Global Error Management:**
```javascript
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
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
- File type and size checks
- Email format verification
- Password strength requirements

### Performance Optimization

**Caching Strategy:**
- Redis caching for frequently accessed data
- Database query optimization
- Image and file compression
- Lazy loading for large datasets

---

## User Workflows

### New Recruiter Onboarding

1. **Account Creation**: Manager creates recruiter account
2. **Initial Login**: Recruiter logs in with temporary credentials
3. **Password Setup**: Recruiter sets permanent password
4. **Profile Completion**: Fill in personal information
5. **Job Assignment**: Manager assigns initial jobs
6. **Training**: System tutorial and documentation access

### Daily Recruitment Workflow

1. **Dashboard Review**: Check statistics and pending tasks
2. **Job Management**: Review assigned jobs and priorities
3. **Candidate Sourcing**: Use ZepDB to find candidates
4. **Resume Processing**: Upload and analyze candidate resumes
5. **Interview Conduction**: Generate questions and evaluate answers
6. **Status Updates**: Update candidate progress
7. **Manager Communication**: Submit approved candidates

### Candidate Evaluation Process

1. **Resume Upload**: Upload candidate resume
2. **AI Analysis**: System analyzes and scores resume
3. **Question Generation**: AI creates relevant interview questions
4. **Interview Conduction**: Recruiter conducts interview
5. **Answer Evaluation**: AI evaluates candidate responses
6. **Final Assessment**: Overall score and recommendation
7. **Decision Making**: Submit to manager or request another round

---

## Conclusion

The Zepul Recruiter System represents a comprehensive solution for modern recruitment challenges. By integrating AI-powered automation with human expertise, the system provides:

**Key Benefits:**
- **Efficiency**: Automated resume analysis and question generation
- **Accuracy**: AI-powered scoring and candidate matching
- **Scalability**: Handle multiple jobs and candidates simultaneously
- **Transparency**: Clear tracking of candidate progress
- **Performance**: Real-time analytics and performance metrics

**Future Enhancements:**
- Advanced AI models for better candidate matching
- Integration with external job boards
- Mobile application for recruiters
- Advanced analytics and reporting features
- Multi-language support

The system successfully bridges the gap between traditional recruitment methods and modern AI technology, creating a more efficient and effective hiring process.

---

**Document End**

*This documentation provides a comprehensive overview of the Zepul Recruiter System. For technical implementation details, please refer to the source code and API documentation.*
