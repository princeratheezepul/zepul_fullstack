import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    },
    
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter"
    },
    
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    // Tag field for categorizing resumes
    tag: {
      type: String,
      enum: ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Finance'],
      required: true
    },
    
    // Basic Information
    name: String,
    title: String, // Professional title
    email: String,
    phone: String,
    experience: String, // Total years of experience
    location: String,
    
    // Skills
    skills: [String],
    non_technical_skills: [String],
    
    // AI Analysis Results
    ats_score: Number,
    ats_reason: String,
    ats_breakdown: {
      skill_match: {
        score: Number,
        reason: String
      },
      experience_relevance: {
        score: Number,
        reason: String
      },
      project_achievement: {
        score: Number,
        reason: String
      },
      ai_generated_detection: {
        score: Number,
        reason: String
      },
      consistency_check: {
        score: Number,
        reason: String
      },
      resume_quality: {
        score: Number,
        reason: String
      },
      interview_prediction: {
        score: Number,
        reason: String
      },
      competitive_fit: {
        score: Number,
        reason: String
      }
    },
    overallScore: Number,
    
    // AI Summary
    aiSummary: {
      technicalExperience: String,
      projectExperience: String,
      education: String,
      keyAchievements: String,
      skillMatch: String,
      competitiveFit: String,
      consistencyCheck: String
    },
    
    // AI Scorecard
    aiScorecard: {
      technicalSkillMatch: Number,
      competitiveFit: Number,
      consistencyCheck: Number,
      teamLeadership: Number
    },
    
    // Recommendation and Analysis
    recommendation: String,
    keyStrength: [String],
    potentialConcern: [String],
    
    // Application Details
    applicationDetails: {
      position: String,
      date: String,
      noticePeriod: String,
      source: String
    },
    
    // Additional Information
    about: String,
    addedNotes: String,
    
    // Original Resume Data
    education: mongoose.Schema.Types.Mixed,
    work_experience: mongoose.Schema.Types.Mixed,
    certifications: mongoose.Schema.Types.Mixed,
    languages: [String],
    suggested_resume_category: String,
    recommended_job_roles: [String],
    number_of_job_jumps: Number,
    average_job_duration_months: Number,
    raw_text: String,
    
    // Status Management
    status: {
      type: String,
      enum: ['scheduled', 'screening', 'submitted', 'shortlisted', 'rejected', 'offered', 'hired'],
      default: 'submitted'
    },
    
    // Interview Management
    interviewScheduled: {
      type: Boolean,
      default: false
    },
    interviewDate: String,
    interviewTime: String,
    interviewDay: String,
    interviewQuestions: [{
      category: String,
      text: String
    }],
    
    // Interview Evaluation Results
    interviewEvaluation: {
      evaluationResults: [{
        question: String,
        answer: String,
        score: Number,
        reason: String,
        confidence: {
          type: String,
          enum: ['High', 'Medium', 'Low']
        }
      }],
      questions: [{
        category: String,
        text: String
      }],
      answers: mongoose.Schema.Types.Mixed,
      evaluatedAt: {
        type: Date,
        default: Date.now
      }
    },
    
    // Score fields for transcript evaluation
    score: {
      type: Number,
      default: 0
    },
    totalscore: {
      type: Number,
      default: 0
    },
    
    // Approval/Rejection Management
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    feedback: { type: String, default: '' },
    rejectFeedback: { type: String, default: '' },
    requestAnotherRound: { type: Boolean, default: false },
    referredToManager: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);
