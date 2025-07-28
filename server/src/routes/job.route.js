import {createJob,getAllJobs,updateJob,deleteJob,assignJob,getJobById,getAdminJobs,getJobCounts,getAdminJobById} from "../controllers/job.controller.js";

import Router from 'express';
import { verifyJWT } from '../middleware/manager.auth.middleware.js';
import { verifyAdminJWT } from '../middleware/admin.auth.middleware.js';
import { verifyJWT as verifyAccountManagerJWT } from '../middleware/accountmanager.auth.middleware.js';
const router=Router();


router.route("/addjob").post(
    verifyJWT,
    createJob
);

router.route("/accountmanager/addjob").post(
    verifyAccountManagerJWT,
    createJob
);

router.route("/getjob").get(getAllJobs);
router.route("/updatejob/:id").put(verifyJWT,updateJob);    
router.route("/deletejob/:id").delete(verifyJWT,deleteJob);
router.route("/:id").get(getJobById);
router.route("/:jobId/assign").put(
    verifyJWT,
    assignJob
);

// New routes for admin dashboard
router.route("/admin/jobs").get(verifyAdminJWT, getAdminJobs);
router.route("/admin/job-counts").get(verifyAdminJWT, getJobCounts);
router.route("/admin/job/:id").get(verifyAdminJWT, getAdminJobById);

export default router;