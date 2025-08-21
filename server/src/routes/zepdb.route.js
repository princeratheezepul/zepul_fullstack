import express from "express";
import { processZepDBQuery, getZepDBStats } from "../controllers/zepdb.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";

const router = express.Router();

// Apply recruiter authentication middleware to all routes
router.use(verifyRecruiterJWT);

// Process ZepDB query
router.post("/query", processZepDBQuery);

// Get ZepDB statistics
router.get("/stats", getZepDBStats);

export default router;
