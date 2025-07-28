import express from "express";
import { saveResume, saveResumeWithJob, getUserResumes, getResumesByJob, searchResumesByJobRole, getResumeById, getResume, requestAnotherRound, submitToManager, updateResumeStatus, scheduleInterview, getResumesByRecruiter, getResumesByTag, updateResumeTag, getResumeStatsByRecruiter, getMonthlySubmissionData, getMonthlyShortlistData, saveInterviewEvaluation, getAverageScoreData } from "../controllers/resume.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";

const router = express.Router();

// More specific routes first
router.post("/save/:jobId", verifyRecruiterJWT, saveResumeWithJob);
router.post("/save", verifyRecruiterJWT, saveResume);
router.get("/recruiter", verifyRecruiterJWT, getResumesByRecruiter);
router.get("/stats/recruiter", verifyRecruiterJWT, getResumeStatsByRecruiter);
router.get("/stats/monthly", verifyRecruiterJWT, getMonthlySubmissionData);
router.get("/stats/shortlist", verifyRecruiterJWT, getMonthlyShortlistData);
router.get("/stats/average-score", verifyRecruiterJWT, getAverageScoreData);
router.get("/tag/:tag", getResumesByTag);
router.get("/job/:jobId", getResumesByJob);
router.get("/search/:jobId", searchResumesByJobRole);
router.get("/:resumeId", getResumeById);
router.get("/", getResume);
router.patch('/:resumeId/tag', updateResumeTag);
router.patch('/:resumeId/status', verifyRecruiterJWT, updateResumeStatus);
router.patch('/:resumeId', verifyRecruiterJWT, updateResumeStatus);
router.patch('/:resumeId/request-another-round', requestAnotherRound);
router.patch('/:resumeId/submit-to-manager', submitToManager);
router.post('/:resumeId/schedule-interview', scheduleInterview);
router.post('/:resumeId/save-interview-evaluation', verifyRecruiterJWT, saveInterviewEvaluation);

export default router;

