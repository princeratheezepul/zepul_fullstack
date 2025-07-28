import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    default: '',
  },
  DOB: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'recruiter',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  jobsclosed:{
    type: Number,
    default: 0,
  },
  avgTAT:{
    type: Number,
    default: 0,
  },
  qualityheatmap:{
    type: Number,
    default: 0,
  },
  redflags:{
    type: Number,
    default: 0,
  },
  offersMade: {
    type: Number,
    default: 0,
  },
  offersAccepted: {
    type: Number,
    default: 0,
  },
  totalHires: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
    default: '',
  },
  assignedCompany: {
    type: String,
    default: '',
  },
  specialization: {
    type: String,
    default: '',
  },
  tatExpectations: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: 'Recruiter',
  },
  manager: {
    type: String,
    default: '',
  },
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'disabled'
  },
  assignedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
}, { timestamps: true });

export default mongoose.model('Recruiter', recruiterSchema);