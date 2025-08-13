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

// Multer for resume files (PDF/DOCX)
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

// Multer for Google Sheets files (CSV/Excel/TXT)
const uploadSheets = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 1 // Only one file
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV, Excel, and text files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, Excel, and text files are allowed'), false);
    }
  }
});

// Routes
router.post('/:jobId', multiAuthMiddleware, upload.array('files', 100), startBulkUpload);
router.post('/:jobId/sheets', multiAuthMiddleware, uploadSheets.single('file'), startBulkUpload);
router.get('/:jobId/status', multiAuthMiddleware, getBulkUploadStatus);
router.get('/:jobId/results', multiAuthMiddleware, getBulkUploadResults);
router.delete('/:jobId', multiAuthMiddleware, cancelBulkUpload);

export default router;
