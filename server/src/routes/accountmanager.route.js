import Router from 'express';
import { verifyJWT } from '../middleware/accountmanager.auth.middleware.js';
import { verifyJWT as verifyAdminJWT } from '../middleware/admin.auth.middleware.js';
const router=Router();

import { loginAccountManager,registerAccountManager,logoutAccountManager,forgotpassword,resetpassword,getAccountManagerInfo,updatePassword,getAllJobs, getJobById, getUniqueCandidates, getDetailsCandidate, getCandidatesByJob, getResumesByJob, updateResumeStatus, updateAccountManagerInfo, createAccountManagerByAdmin, validateSetPassword, setPassword, refreshAccessToken } from '../controllers/accountmanager.controller.js';
import { getResumeStatsForAccountManager, getShortlistedResumesForAccountManager, getResumeForScorecard } from '../controllers/resume.controller.js';
import { getAllRecruiters } from '../controllers/recruiter.controller.js';
router.route("/register").post(
    registerAccountManager
);

router.route("/login").post(loginAccountManager);
router.route("/logout").post(verifyJWT,logoutAccountManager);
router.route("/refresh-token").post(refreshAccessToken);


router.route("/forgot-password").post(forgotpassword);
router.route("/reset-password/:id/:token").post(resetpassword);
router.route("/update-password").put(verifyJWT,updatePassword);
router.route("/getjob").get(verifyJWT,getAllJobs);
router.route("/job/:jobId").get(verifyJWT,getJobById);
router.route("/candidates").get(getUniqueCandidates);
router.route("/candidates/:resumeId").get(getDetailsCandidate);
router.route("/job/:jobId/candidates").get(verifyJWT,getCandidatesByJob);
router.route("/resumes/job/:jobId").get(verifyJWT,getResumesByJob);
router.route("/resumes/:resumeId").patch(verifyJWT,updateResumeStatus);
router.route("/resumes/stats").get(verifyJWT,getResumeStatsForAccountManager);
router.route("/resumes/shortlisted").get(verifyJWT,getShortlistedResumesForAccountManager);
router.route("/resumes/scorecard/:resumeId").get(verifyJWT,getResumeForScorecard);
router.get('/recruiters', getAllRecruiters);

// Admin routes (admin authentication required)
router.route("/create-by-admin").post(verifyAdminJWT, createAccountManagerByAdmin);

// Password set routes (public)
router.route("/validate-set-password/:id/:token").get(validateSetPassword);
router.route("/set-password/:id/:token").post(setPassword);

router.route("/:accountmanagerId").get(verifyJWT,getAccountManagerInfo);
router.route("/:accountmanagerId").put(verifyJWT, updateAccountManagerInfo);

export default router;