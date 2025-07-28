import express from 'express';
import { recruiterSignup, recruiterSignin, recruiterLogout, getRecruitersByCreator,updateRecruiter,updateRecruiterProfile,getRecruiterById, updateRecruiterDetails, getRecruiterProfile,testRecruiterAuth,toggleRecruiterStatus,getAllRecruiters,forgotpassword,resetpassword, changeRecruiterPassword, setPassword, validateSetPassword, getUserById, createRecruiterByAdmin, createRecruiterByManager, deleteRecruiter, getAssignedJobs, getRecruiterStats, refreshRecruiterToken } from '../controllers/recruiter.controller.js';
import { verifyRecruiterJWT } from '../middleware/recruiter.auth.middleware.js';
import { verifyJWT as verifyAdminJWT } from '../middleware/admin.auth.middleware.js';
import { verifyJWT as verifyManagerJWT } from '../middleware/manager.auth.middleware.js';
import { verifyMultiJWT } from '../middleware/multi.auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', recruiterSignup);
router.post('/signin', recruiterSignin);

// Test authentication route
router.get('/test-auth', verifyRecruiterJWT, testRecruiterAuth);
router.post('/logout', recruiterLogout);
router.post('/refresh-token', refreshRecruiterToken);

// Password reset routes (public)
router.post('/forgot-password', forgotpassword);
router.post('/reset-password/:id/:token', resetpassword);
router.get('/validate-set-password/:id/:token', validateSetPassword);
router.post('/set-password/:id/:token', setPassword);

// Admin routes (admin authentication required)
router.post('/create-by-admin', verifyAdminJWT, createRecruiterByAdmin);

// Manager routes (manager authentication required)
router.post('/create-by-manager', verifyManagerJWT, createRecruiterByManager);

// Protected routes (authentication required)
router.get('/getallrecruiters', verifyRecruiterJWT, getAllRecruiters);
router.get('/getrecruiter', verifyMultiJWT, getRecruitersByCreator);
router.get('/assigned-jobs', verifyRecruiterJWT, getAssignedJobs);
router.get('/stats', verifyRecruiterJWT, getRecruiterStats);

// Test route
router.get('/test-auth', verifyRecruiterJWT, testRecruiterAuth);

// Profile routes (must come before /:id routes)
router.get('/profile', verifyRecruiterJWT, getRecruiterProfile);
router.put('/profile', verifyRecruiterJWT, updateRecruiterProfile);

// Other protected routes
router.get('/:id', verifyMultiJWT, getRecruiterById);
router.put('/:id', verifyMultiJWT, updateRecruiterDetails);
router.patch('/:id', verifyMultiJWT, updateRecruiterDetails);
router.delete('/:id', verifyMultiJWT, deleteRecruiter);

// Add password change route for recruiter
router.put('/change-password', verifyRecruiterJWT, changeRecruiterPassword);

router.get('/user/:id', getUserById);

export default router;
