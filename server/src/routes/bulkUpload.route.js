import express from 'express';
import multer from 'multer';
import { multiAuthMiddleware } from '../middleware/multi.auth.middleware.js';
import {
  startBulkUpload,
  getBulkUploadStatus,
  getBulkUploadResults,
  cancelBulkUpload
} from '../controllers/bulkUpload.controller.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 100 // Maximum 100 files
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and DOCX files only
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// Routes
router.post('/:jobId', multiAuthMiddleware, upload.array('files', 100), startBulkUpload);
router.get('/:jobId/status', multiAuthMiddleware, getBulkUploadStatus);
router.get('/:jobId/results', multiAuthMiddleware, getBulkUploadResults);
router.delete('/:jobId', multiAuthMiddleware, cancelBulkUpload);

export default router;
