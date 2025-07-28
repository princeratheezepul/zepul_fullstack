import express from "express";
import { saveResume, saveResumeWithJob, getUserResumes, getResumesByJob, searchResumesByJobRole, getResumeById, getResume, requestAnotherRound, submitToManager, updateResumeStatus, scheduleInterview, getResumesByRecruiter, getResumesByTag, updateResumeTag, getResumeStatsByRecruiter, getMonthlySubmissionData, getMonthlyShortlistData, saveInterviewEvaluation, getAverageScoreData, getResumesByManager } from "../controllers/resume.controller.js";
import { verifyJWT } from "../middleware/manager.auth.middleware.js";

const router = express.Router();

// More specific routes first
router.post("/save/:jobId", verifyJWT, saveResumeWithJob);
router.post("/save", verifyJWT, saveResume);
router.get("/recruiter", verifyJWT, getResumesByRecruiter);
router.get("/recruiter/:recruiterId", verifyJWT, getResumesByRecruiter);
router.get("/stats/recruiter", verifyJWT, getResumeStatsByRecruiter);
router.get("/stats/monthly", verifyJWT, getMonthlySubmissionData);
router.get("/stats/shortlist", verifyJWT, getMonthlyShortlistData);
router.get("/stats/average-score", verifyJWT, getAverageScoreData);
router.get("/manager/:managerId", verifyJWT, getResumesByManager);
router.get("/tag/:tag", getResumesByTag);
router.get("/job/:jobId", getResumesByJob);
router.get("/search/:jobId", searchResumesByJobRole);
router.get("/:resumeId", getResumeById);
router.get("/", getResume);
router.patch('/:resumeId/tag', updateResumeTag);
router.patch('/:resumeId/status', verifyJWT, updateResumeStatus);
router.patch('/:resumeId', verifyJWT, updateResumeStatus);
router.patch('/:resumeId/request-another-round', requestAnotherRound);
router.patch('/:resumeId/submit-to-manager', submitToManager);
router.post('/:resumeId/schedule-interview', scheduleInterview);
router.post('/:resumeId/save-interview-evaluation', verifyJWT, saveInterviewEvaluation);

export default router; 