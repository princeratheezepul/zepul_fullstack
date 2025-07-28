import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    jobtitle: {
      type: String,
      required: true,
      // unique: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    type: {
      type: String,
      enum: ['remote', 'onsite'],
    },
    employmentType: {
      type: String,
      default: 'Full-time'
    },
    salary: {
      min: { type: Number },
      max: { type: Number }
    },
    keyResponsibilities: {
      type: [String],
      default: []
    },
    preferredQualifications: {
      type: [String],
      default: []
    },
    openpositions: {
      type: Number,
    },
    skills: {
      type: [String], 
    },
    experience: {
      type: Number,
    },
    priority: {
      type: [String],
      enum: ['Low', 'Medium', 'High'],
      default: []
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    totalApplication_number: {
      type: Number,
      default: 0,
    },
    shortlisted_number: {
      type: Number,
      default: 0,
    },
    interviewed_number: {
      type: Number,
      default: 0,
    },
    "2ndround_interviewed_number": {
      type: Number,
      default: 0,
    },
    isAssigned:{
      type: Boolean,
      default: false,
    },
    assignedTo:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ] ,
    assignedRecruiters:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
      },
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    company: {
      type: String,
    },
    managerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    accountManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive:{
      type:Boolean,
      default:true,
    },
    hiringDeadline: {
      type: Date,
    },
    internalNotes: {
      type: String,
      default: ""
    },
    total_interview_rounds: {
      type: Number,
      default: 1
    }
  },

  { timestamps: true }
);

export const Job = mongoose.model("Job", JobSchema);
