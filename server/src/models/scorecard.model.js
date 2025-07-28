import mongoose from 'mongoose';
const ScorecardSchema = new mongoose.Schema({
  candidateId: String,
  resume: mongoose.Schema.Types.Mixed,
  answers: [String],
  averageScore: Number,
  skillScores: [
    {
      skill: String,
      score: Number
    }
  ],
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  feedback: { type: String, default: '' },
  rejectFeedback: { type: String, default: '' },
  requestAnotherRound: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  evaluatedAnswers: [
    {
      answerType: String,
      scores: {
        'terminology used': Number,
        'process explained': Number,
        'tool usage accuracy': Number,
        'logical flow': Number
      },
      total: mongoose.Schema.Types.Mixed
    }
  ],
  jobId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  note: {
    type: String,
    default: ''
  },
  submittedAt: Date
});

const Scorecard = mongoose.model('Scorecard', ScorecardSchema);
export default Scorecard;
