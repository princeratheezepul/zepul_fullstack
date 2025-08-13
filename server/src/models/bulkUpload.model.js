import mongoose from "mongoose";

const bulkUploadJobSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter'
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadMethod: {
    type: String,
    enum: ['folder', 'drive'],
    required: true
  },
  driveLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  totalFiles: {
    type: Number,
    default: 0
  },
  processedFiles: {
    type: Number,
    default: 0
  },
  successfulFiles: {
    type: Number,
    default: 0
  },
  failedFiles: {
    type: Number,
    default: 0
  },
  currentFile: {
    type: String
  },
  error: {
    type: String
  },
  results: [{
    fileName: String,
    status: {
      type: String,
      enum: ['success', 'failed']
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    error: String
  }]
}, {
  timestamps: true
});

const BulkUploadJob = mongoose.model('BulkUploadJob', bulkUploadJobSchema);

export default BulkUploadJob;
