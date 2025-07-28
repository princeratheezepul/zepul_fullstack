import {loginAdmin,registerAdmin,getAdminInfo,logoutAdmin,getManagerByAdmin, assignedCompany, removeManagerFromCompany, toggleJobStatusByAdmin, createCompany,getCompany,updatecompany, getRecruiterByAdmin, getJobsByAdmin, getCompanyByAdmin, createJobByAdmin, assignRecruitersByAdmin, forgotpassword,resetpassword,updatePassword, updatejobByAdmin, deletejob,getUniqueCandidates,getDetailsCandidate,updateNote, getAdminProfile, updateAdminProfile, getUserCounts, getUsersByAdmin,refreshAccessToken, deleteUserByAdmin, toggleUserStatusByAdmin, getJobsByAdminForDashboard, updateJobByAdminForDashboard, getJobByIdForAdminDashboard, assignRecruitersToJobByAdminDashboard, getCandidatesForJobByAdminDashboard, getResumesByJobForAdmin, updateResumeStatusByAdmin, updateResumeNoteByAdmin, getJobStatisticsForAdmin} from '../controllers/admin.controller.js';

import Router from 'express';
import { verifyJWT } from '../middleware/admin.auth.middleware.js';
const router=Router();


router.route("/register").post(
    registerAdmin
);

router.route("/candidates").get(getUniqueCandidates);
router.route("/candidates/:resumeId").get(getDetailsCandidate);


router.route("/login").post(loginAdmin);
router.route("/logout").post(verifyJWT,logoutAdmin);
router.route("/refresh-token").post(refreshAccessToken);

// Profile routes - must come before /:adminId route
router.route("/profile").get(verifyJWT, getAdminProfile);
router.route("/profile").put(verifyJWT, updateAdminProfile);

router.route("/forgot-password").post(forgotpassword);
router.route("/reset-password/:id/:token").post(resetpassword);
router.route("/update-password").put(verifyJWT,updatePassword);

router.route("/getmanagerbyadmin/:adminId").get(verifyJWT, getManagerByAdmin); 

router.route("/create-company").post(verifyJWT,createCompany);
router.route("/get-company/:adminId").get(verifyJWT, getCompany);
router.route("/assign-manager/:companyId").post(verifyJWT, assignedCompany);
router.route("/remove-manager/:companyId").post(verifyJWT, removeManagerFromCompany);
router.route("/update-company-industrysize/:companyId").put(verifyJWT, updatecompany); 


router.route("/getrecruiterbyAdmin/:adminId").get(verifyJWT,getRecruiterByAdmin);
router.route("/getjobs/:adminId").get(verifyJWT,getJobsByAdmin);
router.route("/getcompany/:adminId").get(verifyJWT,getCompanyByAdmin);
router.route("/createjob").post(verifyJWT,createJobByAdmin);
router.route("/assignrecruiter/:jobId").post(verifyJWT,assignRecruitersByAdmin);
router.route("/updatejob/:id").put(verifyJWT,updatejobByAdmin)
router.route("/togglejobstatus/:id").put(verifyJWT, toggleJobStatusByAdmin);
router.route("/deletejob/:jobId").delete(verifyJWT,deletejob)

router.patch('/note/:resumeId', verifyJWT, updateNote);

// User management routes
router.route("/user-counts").get(verifyJWT, getUserCounts);
router.route("/users").get(verifyJWT, getUsersByAdmin);
router.route("/users/:userId").delete(verifyJWT, deleteUserByAdmin);
router.route("/users/:userId/toggle-status").put(verifyJWT, toggleUserStatusByAdmin);

// Admin Jobs Dashboard routes
router.route("/get-jobs/:adminId").get(verifyJWT, getJobsByAdminForDashboard);
router.route("/job/:jobId").get(verifyJWT, getJobByIdForAdminDashboard);
router.route("/job/:jobId").put(verifyJWT, updateJobByAdminForDashboard);
router.route("/assign-recruiters/:jobId").put(verifyJWT, assignRecruitersToJobByAdminDashboard);
router.route("/job/:jobId/candidates").get(verifyJWT, getCandidatesForJobByAdminDashboard);
router.route("/create-job").post(verifyJWT, createJobByAdmin);

// Admin Resume Management routes
router.route("/resumes/job/:jobId").get(verifyJWT, getResumesByJobForAdmin);
router.route("/resumes/:resumeId").patch(verifyJWT, updateResumeStatusByAdmin);
router.route("/resumes/:resumeId/note").patch(verifyJWT, updateResumeNoteByAdmin);

// Admin Job Statistics route
router.route("/job/:jobId/statistics").get(verifyJWT, getJobStatisticsForAdmin);

// Place the parameterized route at the end
router.route("/:adminId").get(verifyJWT,getAdminInfo);

export default router;