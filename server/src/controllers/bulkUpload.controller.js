import BulkUploadJob from "../models/bulkUpload.model.js";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import Recruiter from "../models/recruiter.model.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { determineResumeTag } from "../utils/tagHelper.js";
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import axios from 'axios';
import XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Initialize Google Generative AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set');
  console.error('📋 Please set up your environment variables following SETUP_ENVIRONMENT.md');
  console.error('🔑 Get your API key from: https://aistudio.google.com/app/apikey');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Initialize Google Drive API (optional - only if credentials are available)
let drive = null;
try {
  const credentialsPath = path.join(__dirname, '../../google-credentials.json');
  if (fs.existsSync(credentialsPath)) {
    drive = google.drive({
      version: 'v3',
      auth: new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      }),
    });
    console.log('✅ Google Drive API initialized successfully');
    console.log('📁 Ready to process Google Drive folders automatically');
  } else {
    console.log('⚠️  Google Drive credentials not found');
    console.log('📋 Please follow the setup guide in GOOGLE_DRIVE_API_SETUP.md');
    console.log('🔗 For now, users can use manual download method');
  }
} catch (error) {
  console.log('❌ Failed to initialize Google Drive API:', error.message);
  console.log('📋 Please check your google-credentials.json file');
}

// @desc Start bulk upload process
export const startBulkUpload = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { uploadMethod, driveLink } = req.body;
    const userId = req.id;
    const userRole = req.role;

    console.log('Starting bulk upload:', { jobId, uploadMethod, userId, userRole });

    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId format" });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Create bulk upload job record
    const bulkJobData = {
      jobId,
      uploadMethod,
      status: 'processing'
    };

    // Add user ID based on role
    console.log('Creating bulk job - User ID:', userId, 'Type:', typeof userId);
    console.log('Creating bulk job - User Role:', userRole);
    
    if (userRole === 'manager') {
      bulkJobData.managerId = userId;
      console.log('Creating bulk job - Set managerId:', userId);
    } else {
      bulkJobData.recruiterId = userId;
      console.log('Creating bulk job - Set recruiterId:', userId);
    }

    // Add drive link if provided
    if (uploadMethod === 'drive' && driveLink) {
      bulkJobData.driveLink = driveLink;
    }

    // Add uploaded file information if provided
    if (uploadMethod === 'sheets' && req.file) {
      bulkJobData.uploadedFile = {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    const bulkJob = new BulkUploadJob(bulkJobData);
    await bulkJob.save();

    console.log('Created bulk upload job:', bulkJob._id);

        // Start processing based on upload method
    if (uploadMethod === 'folder' && req.files) {
      // Process uploaded files
      await processUploadedFiles(bulkJob._id, req.files, job);
    } else if (uploadMethod === 'drive' && driveLink) {
      // Process Google Drive files (with or without API credentials)
      await processDriveFiles(bulkJob._id, driveLink, job);
    } else if (uploadMethod === 'sheets' && req.file) {
      // Process Google Sheets file
      await processGoogleSheets(bulkJob._id, req.file, job);
    } else {
      return res.status(400).json({ message: "Invalid upload method or missing files" });
    }

    // Check if the job was marked as failed during processing
    const updatedJob = await BulkUploadJob.findById(bulkJob._id);
    if (updatedJob.status === 'failed') {
      return res.status(400).json({ 
        message: updatedJob.error || "Bulk upload failed", 
        jobId: bulkJob._id 
      });
    }

    res.status(201).json({ 
      message: "Bulk upload started successfully", 
      jobId: bulkJob._id 
    });

  } catch (error) {
    console.error('Error starting bulk upload:', error);
    res.status(500).json({ 
      message: "Failed to start bulk upload", 
      error: error.message 
    });
  }
};

// @desc Get bulk upload status
export const getBulkUploadStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.id;
    const userRole = req.role;

    console.log('Status check - Job ID:', jobId);
    console.log('Status check - User ID:', userId, 'Type:', typeof userId);
    console.log('Status check - User Role:', userRole);

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId format" });
    }

    const bulkJob = await BulkUploadJob.findById(jobId);
    if (!bulkJob) {
      return res.status(404).json({ message: "Bulk upload job not found" });
    }

    console.log('Status check - Bulk Job found:', bulkJob._id);
    console.log('Status check - Manager ID:', bulkJob.managerId, 'Type:', typeof bulkJob.managerId);
    console.log('Status check - Recruiter ID:', bulkJob.recruiterId, 'Type:', typeof bulkJob.recruiterId);

    // Check if user has access to this job
    if (userRole === 'manager' && bulkJob.managerId?.toString() !== userId?.toString()) {
      console.log('Access denied - Manager ID mismatch');
      return res.status(403).json({ message: "Access denied" });
    }
    if (userRole === 'recruiter' && bulkJob.recruiterId?.toString() !== userId?.toString()) {
      console.log('Access denied - Recruiter ID mismatch');
      return res.status(403).json({ message: "Access denied" });
    }
    
    console.log('Access granted for bulk upload status check');

    res.status(200).json({
      status: bulkJob.status,
      totalFiles: bulkJob.totalFiles,
      processedFiles: bulkJob.processedFiles,
      successfulFiles: bulkJob.successfulFiles,
      failedFiles: bulkJob.failedFiles,
      currentFile: bulkJob.currentFile,
      error: bulkJob.error
    });

  } catch (error) {
    console.error('Error getting bulk upload status:', error);
    res.status(500).json({ 
      message: "Failed to get bulk upload status", 
      error: error.message 
    });
  }
};

// @desc Get bulk upload results
export const getBulkUploadResults = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.id;
    const userRole = req.role;

    console.log('Results check - Job ID:', jobId);
    console.log('Results check - User ID:', userId, 'Type:', typeof userId);
    console.log('Results check - User Role:', userRole);

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId format" });
    }

    const bulkJob = await BulkUploadJob.findById(jobId);
    if (!bulkJob) {
      return res.status(404).json({ message: "Bulk upload job not found" });
    }

    console.log('Results check - Bulk Job found:', bulkJob._id);
    console.log('Results check - Manager ID:', bulkJob.managerId, 'Type:', typeof bulkJob.managerId);
    console.log('Results check - Recruiter ID:', bulkJob.recruiterId, 'Type:', typeof bulkJob.recruiterId);

    // Check if user has access to this job
    if (userRole === 'manager' && bulkJob.managerId?.toString() !== userId?.toString()) {
      console.log('Access denied - Manager ID mismatch for results');
      return res.status(403).json({ message: "Access denied" });
    }
    if (userRole === 'recruiter' && bulkJob.recruiterId?.toString() !== userId?.toString()) {
      console.log('Access denied - Recruiter ID mismatch for results');
      return res.status(403).json({ message: "Access denied" });
    }
    
    console.log('Access granted for bulk upload results check');

    // Get successful resumes
    const successfulResumes = await Resume.find({
      _id: { $in: bulkJob.results.filter(r => r.status === 'success').map(r => r.resumeId) }
    }).select('name email title overallScore status createdAt');

    // Get failed files
    const failedFiles = bulkJob.results.filter(r => r.status === 'failed');

    res.status(200).json({
      total: bulkJob.totalFiles,
      successful: bulkJob.successfulFiles,
      failed: bulkJob.failedFiles,
      successfulResumes,
      failedFiles
    });

  } catch (error) {
    console.error('Error getting bulk upload results:', error);
    res.status(500).json({ 
      message: "Failed to get bulk upload results", 
      error: error.message 
    });
  }
};

// @desc Cancel bulk upload
export const cancelBulkUpload = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.id;
    const userRole = req.role;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId format" });
    }

    const bulkJob = await BulkUploadJob.findById(jobId);
    if (!bulkJob) {
      return res.status(404).json({ message: "Bulk upload job not found" });
    }

    // Check if user has access to this job
    if (userRole === 'manager' && bulkJob.managerId?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (userRole === 'recruiter' && bulkJob.recruiterId?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update status to failed
    bulkJob.status = 'failed';
    bulkJob.error = 'Cancelled by user';
    await bulkJob.save();

    res.status(200).json({ message: "Bulk upload cancelled successfully" });

  } catch (error) {
    console.error('Error cancelling bulk upload:', error);
    res.status(500).json({ 
      message: "Failed to cancel bulk upload", 
      error: error.message 
    });
  }
};

// Process uploaded files (folder upload)
const processUploadedFiles = async (bulkJobId, files, job) => {
  try {
    const bulkJob = await BulkUploadJob.findById(bulkJobId);
    bulkJob.totalFiles = files.length;
    await bulkJob.save();

    console.log(`Processing ${files.length} uploaded files for bulk job ${bulkJobId}`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        bulkJob.currentFile = file.originalname;
        await bulkJob.save();

        const result = await processResumeFile(file, job, bulkJob);
        
        // Save result
        bulkJob.results.push({
          fileName: file.originalname,
          status: 'success',
          resumeId: result._id
        });
        bulkJob.successfulFiles++;
        
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        
        bulkJob.results.push({
          fileName: file.originalname,
          status: 'failed',
          error: error.message
        });
        bulkJob.failedFiles++;
      }
      
      bulkJob.processedFiles++;
      await bulkJob.save();
    }

    bulkJob.status = 'completed';
    bulkJob.currentFile = null;
    await bulkJob.save();

    console.log(`Bulk job ${bulkJobId} completed: ${bulkJob.successfulFiles} successful, ${bulkJob.failedFiles} failed`);

  } catch (error) {
    console.error('Error in processUploadedFiles:', error);
    const bulkJob = await BulkUploadJob.findById(bulkJobId);
    bulkJob.status = 'failed';
    bulkJob.error = error.message;
    await bulkJob.save();
  }
};

// Process Google Sheets files
const processGoogleSheets = async (bulkJobId, file, job) => {
  try {
    console.log('Processing Google Sheets file:', file.originalname);
    
    // Parse the file to extract URLs
    const urls = await parseGoogleSheets(file.buffer, file.mimetype);
    
    if (!urls || urls.length === 0) {
      throw new Error('No valid Google Drive/Docs URLs found in the file');
    }
    
    console.log(`Found ${urls.length} valid URLs in Google Sheets file`);
    
    const bulkJob = await BulkUploadJob.findById(bulkJobId);
    bulkJob.totalFiles = urls.length;
    await bulkJob.save();
    
    console.log(`Processing ${urls.length} files from Google Sheets for bulk job ${bulkJobId}`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        bulkJob.currentFile = `URL ${i + 1}: ${url.substring(0, 50)}...`;
        await bulkJob.save();
        
        // Download file from Google URL
        const buffer = await downloadFromGoogleUrl(url);
        
        // Determine file type
        let mimeType = 'application/pdf';
        if (url.includes('/document/')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        
        // Process the file
        const result = await processResumeBuffer(buffer, `resume_${i + 1}`, mimeType, job, bulkJob);
        
        // Save result
        bulkJob.results.push({
          fileName: `resume_${i + 1}`,
          status: 'success',
          resumeId: result._id,
          url: url
        });
        bulkJob.successfulFiles++;
        
      } catch (error) {
        console.error(`Error processing URL ${i + 1}:`, error);
        
        bulkJob.results.push({
          fileName: `resume_${i + 1}`,
          status: 'failed',
          error: error.message,
          url: url
        });
        bulkJob.failedFiles++;
      }
      
      bulkJob.processedFiles++;
      await bulkJob.save();
    }
    
    bulkJob.status = 'completed';
    bulkJob.currentFile = null;
    await bulkJob.save();
    
    console.log(`Bulk job ${bulkJobId} completed: ${bulkJob.successfulFiles} successful, ${bulkJob.failedFiles} failed`);
    
  } catch (error) {
    console.error('Error in processGoogleSheets:', error);
    const bulkJob = await BulkUploadJob.findById(bulkJobId);
    bulkJob.status = 'failed';
    bulkJob.error = error.message;
    await bulkJob.save();
  }
};

// Process Google Drive files
const processDriveFiles = async (bulkJobId, driveLink, job) => {
  try {
    const folderId = extractFolderIdFromLink(driveLink);
    if (!folderId) {
      throw new Error('Invalid Google Drive folder link');
    }

    let files = [];
    
    if (drive) {
      // Use Google Drive API if credentials are available
      console.log('Using Google Drive API method');
      console.log('Folder ID:', folderId);
      
      try {
        const response = await drive.files.list({
          q: `'${folderId}' in parents and (mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')`,
          fields: 'files(id, name, mimeType)',
        });
        files = response.data.files;
        console.log('Found files:', files.length);
        files.forEach(file => console.log('-', file.name));
      } catch (driveError) {
        console.error('Google Drive API error:', driveError.message);
        throw new Error(`Google Drive API error: ${driveError.message}. Please make sure the folder is shared with the service account: zepul-drive-service@total-vertex-468822-r1.iam.gserviceaccount.com`);
      }
    } else {
      // Use public link method
      console.log('Using public link method');
      const publicResult = await getFilesFromPublicDrive(folderId);
      if (publicResult.isPublicFolder) {
        throw new Error('Google Drive API not configured. Please use folder upload option.');
      }
      files = publicResult;
    }

    if (!files || files.length === 0) {
      throw new Error('No resume files found in the Google Drive folder');
    }

    const bulkJob = await BulkUploadJob.findById(bulkJobId);
    bulkJob.totalFiles = files.length;
    await bulkJob.save();

    console.log(`Processing ${files.length} files from Drive for bulk job ${bulkJobId}`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        bulkJob.currentFile = file.name;
        await bulkJob.save();

        // Download file from Drive
        const buffer = await downloadFileFromDrive(file.id);
        
        // Process the file
        const result = await processResumeBuffer(buffer, file.name, file.mimeType, job, bulkJob);
        
        // Save result
        bulkJob.results.push({
          fileName: file.name,
          status: 'success',
          resumeId: result._id
        });
        bulkJob.successfulFiles++;
        
      } catch (error) {
        console.error(`Error processing Drive file ${file.name}:`, error);
        
        bulkJob.results.push({
          fileName: file.name,
          status: 'failed',
          error: error.message
        });
        bulkJob.failedFiles++;
      }
      
      bulkJob.processedFiles++;
      await bulkJob.save();
    }

    bulkJob.status = 'completed';
    bulkJob.currentFile = null;
    await bulkJob.save();

    console.log(`Bulk job ${bulkJobId} completed: ${bulkJob.successfulFiles} successful, ${bulkJob.failedFiles} failed`);

  } catch (error) {
    console.error('Error in processDriveFiles:', error);
    const bulkJob = await BulkUploadJob.findById(bulkJobId);
    bulkJob.status = 'failed';
    bulkJob.error = error.message;
    await bulkJob.save();
  }
};

// Process a single resume file
const processResumeFile = async (file, job, bulkJobData = null) => {
  let text = "";
  
  if (file.mimetype === "application/pdf") {
    text = await extractTextFromPDF(file.buffer);
  } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    text = await extractTextFromDocx(file.buffer);
  } else {
    throw new Error("Unsupported file format");
  }

  // Analyze resume with AI
  const analysis = await analyzeResume(text, job);
  
  // Calculate ATS score
  const atsResult = await calculateATSScore(text, job);

  return await saveResumeToDatabase(analysis, atsResult, job, text, bulkJobData);
};

// Process resume buffer (for Drive files)
const processResumeBuffer = async (buffer, fileName, mimeType, job, bulkJobData = null) => {
  let text = "";
  
  if (mimeType === "application/pdf") {
    text = await extractTextFromPDF(buffer);
  } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    text = await extractTextFromDocx(buffer);
  } else {
    throw new Error("Unsupported file format");
  }

  // Analyze resume with AI
  const analysis = await analyzeResume(text, job);
  
  // Calculate ATS score
  const atsResult = await calculateATSScore(text, job);

  // Save to database and return the saved resume
  return await saveResumeToDatabase(analysis, atsResult, job, text, bulkJobData);
};

// Extract text from PDF using pdfjs-dist with CommonJS require
const extractTextFromPDF = async (buffer) => {
  try {
    console.log('PDF extraction - Buffer type:', typeof buffer);
    console.log('PDF extraction - Buffer length:', buffer?.length);
    console.log('PDF extraction - Is Buffer:', Buffer.isBuffer(buffer));

    if (!buffer || buffer.length === 0) {
      throw new Error("PDF buffer is empty or invalid");
    }

    console.log('PDF extraction - Loading pdfjs-dist using require');
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

    console.log('PDF extraction - pdfjs-dist loaded successfully');

    // Convert Buffer to Uint8Array as required by pdfjs-dist
    const uint8Array = new Uint8Array(buffer);
    console.log('PDF extraction - Converted to Uint8Array, length:', uint8Array.length);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    console.log('PDF extraction - PDF loaded, pages:', pdf.numPages);

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + " ";
    }

    console.log('PDF extraction - Text extracted, length:', fullText.length);

    if (fullText.trim().length === 0) {
      throw new Error("PDF contains no readable text");
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF parsing error:", err.message);
    console.error("PDF parsing stack:", err.stack);
    
    // If pdfjs-dist fails, try alternative approach
    if (err.message.includes('Cannot find module') || err.message.includes('pdfjs-dist')) {
      console.log('PDF extraction - Falling back to alternative method');
      try {
        // Try using a different PDF parsing approach
        const { PDFExtract } = require('pdf.js-extract');
        const pdfExtract = new PDFExtract();
        const options = {};
        
        const data = await pdfExtract.extractBuffer(buffer, options);
        const text = data.pages.map(page => page.content.map(item => item.str).join(' ')).join(' ');
        
        if (text.trim().length === 0) {
          throw new Error("PDF contains no readable text");
        }
        
        return text.trim();
      } catch (fallbackErr) {
        console.error("PDF fallback parsing error:", fallbackErr.message);
        throw new Error(`Failed to read PDF: ${err.message}`);
      }
    }
    
    throw new Error(`Failed to read PDF: ${err.message}`);
  }
};

// Extract text from DOCX
const extractTextFromDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    throw new Error("Failed to read DOCX file");
  }
};

// Analyze resume with AI
const analyzeResume = async (resumeText, job) => {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please set up GEMINI_API_KEY environment variable. Get your API key from: https://aistudio.google.com/app/apikey');
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `
    You are an expert AI recruiter analyzing a resume for a specific job.
    Job Details:
    - Title: ${job.jobtitle}
    - Description: ${job.description}
    - Required Skills: ${job.skills?.join(", ") || ""}

    Resume Text:
    ---
    ${resumeText}
    ---

    Based on the job details and resume text, provide a detailed analysis in a pure JSON format. Do not include any markdown, code blocks, or explanations. The JSON object should have the following structure:
    {
      "name": "Full Name",
      "title": "Professional Title (e.g., Senior Frontend Developer)",
      "skills": ["Top 10 most relevant technical skills from the resume"],
      "email": "contact@email.com",
      "phone": "+1234567890",
      "experience": "Total years of experience as a string (e.g., '5 years')",
      "location": "City, Country",
      "aiSummary": {
        "technicalExperience": "A 1-2 sentence summary of their technical background.",
        "projectExperience": "A 1-2 sentence summary of their project work and accomplishments.",
        "education": "A 1-2 sentence summary of their educational qualifications.",
        "keyAchievements": "A 1-2 sentence summary of their most impressive achievements.",
        "skillMatch": "A 1-2 sentence analysis of how well the candidate's technical skills, tools, and technologies align with the specific job requirements and responsibilities.",
        "competitiveFit": "A 1-2 sentence assessment of the candidate's competitive position in the market for this role, considering their experience level, achievements, and market demand.",
        "consistencyCheck": "A 1-2 sentence evaluation of the candidate's career consistency, job stability, progression patterns, and professional growth trajectory."
      },
      "aiScorecard": {
        "technicalSkillMatch": "Number (0-100) representing how well their skills match the job requirements.",
        "competitiveFit": "Number (0-100) representing the candidate's competitive position in the market for this role.",
        "consistencyCheck": "Number (0-100) representing the candidate's career consistency, job stability, and progression patterns.",
        "teamLeadership": "Number (0-100) based on any management or leadership roles, and mentorship experience mentioned."
      },
      "recommendation": "A short, decisive recommendation (e.g., 'Recommended for next round', 'Strong contender', 'Consider with caution').",
      "keyStrength": ["A bullet point list of 2-3 key strengths for this specific role."],
      "potentialConcern": ["A bullet point list of 2-3 potential concerns or areas to probe in an interview."],
      "about": "A brief 'About' section copied or summarized from the resume.",
      "applicationDetails": {
          "position": "${job.jobtitle}",
          "date": "${new Date().toLocaleDateString()}",
          "noticePeriod": "Extract from resume if available, otherwise 'N/A'",
          "source": "Website"
      }
    }

    IMPORTANT: For the new fields in aiSummary:
    - skillMatch: Analyze the candidate's technical skills against the job requirements and provide a clear assessment
    - competitiveFit: Evaluate their market position and competitiveness for this specific role
    - consistencyCheck: Assess their career stability, progression, and professional development patterns
    
    Make sure all fields in aiSummary contain meaningful, detailed content that provides valuable insights for the recruiter.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // More robust JSON cleaning
  let cleanedText = text.replace(/```json|```/g, "").trim();
  
  // Remove any leading/trailing non-JSON content
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
  }
  
  try {
    return JSON.parse(cleanedText);
  } catch (parseError) {
    console.error('JSON parsing error for resume analysis:', parseError);
    console.error('Raw response:', text);
    console.error('Cleaned text:', cleanedText);
    
    // Return a fallback structure if parsing fails
    return {
      name: "Unknown",
      title: "Not specified",
      skills: [],
      email: "Not found",
      phone: "Not found",
      experience: "Not specified",
      location: "Not specified",
      aiSummary: {
        technicalExperience: "Unable to parse resume content.",
        projectExperience: "Unable to parse resume content.",
        education: "Unable to parse resume content.",
        keyAchievements: "Unable to parse resume content.",
        skillMatch: "Unable to analyze due to parsing error.",
        competitiveFit: "Unable to analyze due to parsing error.",
        consistencyCheck: "Unable to analyze due to parsing error."
      },
      aiScorecard: {
        technicalSkillMatch: 0,
        competitiveFit: 0,
        consistencyCheck: 0,
        teamLeadership: 0
      },
      recommendation: "Review manually - parsing error occurred",
      keyStrength: ["Manual review required"],
      potentialConcern: ["Resume parsing failed"],
      about: "Resume content could not be parsed automatically.",
      applicationDetails: {
        position: job.jobtitle,
        date: new Date().toLocaleDateString(),
        noticePeriod: "N/A",
        source: "Website"
      }
    };
  }
};

// Calculate ATS Score
const calculateATSScore = async (resumeText, job) => {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please set up GEMINI_API_KEY environment variable.');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are a strict, realistic ATS evaluator. Calculate ATS score out of 100 using weighted criteria below. BE CONSERVATIVE with scoring - most resumes should score 60-80, with only exceptional candidates scoring 85+.

    Criteria, weights, and STRICT scoring guidelines:
    {
      "Skill Match (Contextual)": 30 // 0-30 points
      // 25-30: Perfect skill alignment (90%+ match)
      // 20-24: Strong match (70-89% skills present)
      // 15-19: Moderate match (50-69% skills present)
      // 10-14: Basic match (30-49% skills present)
      // 0-9: Poor/no match (<30% skills present)

      "Experience Relevance & Depth": 25 // 0-25 points
      // 22-25: Highly relevant exp, exceeds requirements
      // 18-21: Relevant exp, meets requirements well
      // 14-17: Somewhat relevant, meets basic requirements
      // 10-13: Limited relevance, below requirements
      // 0-9: Irrelevant or insufficient experience

      "Project & Achievement Validation": 15 // 0-15 points
      // 13-15: Quantified achievements, impressive projects
      // 10-12: Some quantified results, good projects
      // 7-9: Basic project mentions, few metrics
      // 4-6: Vague projects, no quantification
      // 0-3: No meaningful projects/achievements

      "Consistency Check": 15 // 0-15 points
      // 13-15: Stable career, logical progression
      // 10-12: Mostly stable, 1-2 short tenures
      // 7-9: Some job hopping, gaps explained
      // 4-6: Frequent job changes, some gaps
      // 0-3: Major inconsistencies, many gaps

      "AI-Generated Resume Detection": 5 // 0-5 points (PENALTY category)
      // 5: Clearly human-written, authentic
      // 3-4: Mostly authentic, some templated sections
      // 1-2: Heavily templated, possibly AI-generated
      // 0: Obviously AI-generated or completely generic

      "Resume Quality Score": 5 // 0-5 points
      // 5: Excellent formatting, clear, professional
      // 3-4: Good formatting, mostly clear
      // 1-2: Poor formatting, unclear sections
      // 0: Very poor quality, hard to read

      "Interview & Behavioral Prediction": 5 // 0-5 points
      // 5: Strong communication indicators, leadership
      // 3-4: Good indicators of soft skills
      // 1-2: Basic indicators present
      // 0: Poor communication indicators

      "Competitive Fit & Market Standing": 5 // 0-5 points
      // 5: Top 10% candidate for this role
      // 3-4: Top 25% candidate
      // 1-2: Average candidate
      // 0: Below average candidate
    }

    CRITICAL SCORING RULES:
    - NO component should exceed its maximum weight
    - Most candidates should score 60-75 total (industry average)
    - Only truly exceptional candidates score 85+
    - Scores of 90+ should be EXTREMELY rare (top 2% of candidates)
    - Be harsh on missing information, generic content, and poor formatting
    - Heavily penalize mismatched experience levels and skill gaps

    Return ONLY a JSON object like this (no markdown, no code formatting):
    {
      "Skill Match (Contextual)": {"score": number, "reason": string},
      "Experience Relevance & Depth": {"score": number, "reason": string},
      "Project & Achievement Validation": {"score": number, "reason": string},
      "AI-Generated Resume Detection": {"score": number, "reason": string},
      "Consistency Check": {"score": number, "reason": string},
      "Resume Quality Score": {"score": number, "reason": string},
      "Interview & Behavioral Prediction": {"score": number, "reason": string},
      "Competitive Fit & Market Standing": {"score": number, "reason": string},
      "ats_score": number, // sum of above, max 100
      "reason": string // 1-2 lines summary of the main factors for the total score
    }

    Job Details:
    Title: ${job.jobtitle}
    Company: ${job.company}
    Location: ${job.location}
    Employment Type: ${job.employmentType}
    Experience: ${job.experience}
    Salary: ${job.salary}
    Posted: ${job.posted}
    Description: ${job.description}
    Responsibilities: ${(job.keyResponsibilities || []).join(", ")}
    Required Skills: ${(job.skills || []).join(", ")}
    Preferred Qualifications: ${(job.preferredQualifications || []).join(", ")}

    Resume Text:
    ${resumeText}
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = await response.text();
  
  // More robust JSON cleaning for ATS score
  let cleanedText = aiText.replace(/```json|```/g, "").trim();
  
  // Remove any leading/trailing non-JSON content
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
  }
  
  try {
    const parsed = JSON.parse(cleanedText);
    
    return {
      ats_score: parsed.ats_score || 50,
      ats_reason: parsed.reason || "ATS score calculated with limited data",
      ats_breakdown: {
        skill_match: parsed["Skill Match (Contextual)"] || { score: 15, reason: "Default scoring applied" },
        experience_relevance: parsed["Experience Relevance & Depth"] || { score: 12, reason: "Default scoring applied" },
        project_achievement: parsed["Project & Achievement Validation"] || { score: 7, reason: "Default scoring applied" },
        ai_generated_detection: parsed["AI-Generated Resume Detection"] || { score: 3, reason: "Default scoring applied" },
        consistency_check: parsed["Consistency Check"] || { score: 7, reason: "Default scoring applied" },
        resume_quality: parsed["Resume Quality Score"] || { score: 3, reason: "Default scoring applied" },
        interview_prediction: parsed["Interview & Behavioral Prediction"] || { score: 2, reason: "Default scoring applied" },
        competitive_fit: parsed["Competitive Fit & Market Standing"] || { score: 1, reason: "Default scoring applied" },
      }
    };
  } catch (parseError) {
    console.error('JSON parsing error for ATS score:', parseError);
    console.error('Raw ATS response:', aiText);
    console.error('Cleaned ATS text:', cleanedText);
    
    // Return fallback ATS score
    return {
      ats_score: 50,
      ats_reason: "ATS score could not be calculated due to parsing error. Manual review recommended.",
      ats_breakdown: {
        skill_match: { score: 15, reason: "Parsing error - default score applied" },
        experience_relevance: { score: 12, reason: "Parsing error - default score applied" },
        project_achievement: { score: 7, reason: "Parsing error - default score applied" },
        ai_generated_detection: { score: 3, reason: "Parsing error - default score applied" },
        consistency_check: { score: 7, reason: "Parsing error - default score applied" },
        resume_quality: { score: 3, reason: "Parsing error - default score applied" },
        interview_prediction: { score: 2, reason: "Parsing error - default score applied" },
        competitive_fit: { score: 1, reason: "Parsing error - default score applied" },
      }
    };
  }
};

// Save resume to database
const saveResumeToDatabase = async (analysis, atsResult, job, rawText, bulkJobData = null) => {
  // Determine tag based on job title and description
  const tag = determineResumeTag(job.jobtitle, job.description);

  const resumeObject = {
    jobId: job._id,
    tag,
    ...analysis,
    overallScore: Math.round(atsResult.ats_score),
    ats_score: atsResult.ats_score,
    ats_reason: atsResult.ats_reason,
    ats_breakdown: atsResult.ats_breakdown,
    raw_text: rawText
  };

  // Add recruiter/manager information if available from bulk job
  if (bulkJobData) {
    if (bulkJobData.recruiterId) {
      resumeObject.recruiterId = bulkJobData.recruiterId;
      
      // Try to get manager ID from recruiter
      try {
        const recruiter = await Recruiter.findById(bulkJobData.recruiterId);
        if (recruiter && recruiter.managerId) {
          resumeObject.managerId = recruiter.managerId;
        }
      } catch (error) {
        console.error('Error fetching recruiter details for managerId:', error);
      }
    } else if (bulkJobData.managerId) {
      resumeObject.managerId = bulkJobData.managerId;
    }
  }

  console.log('Saving resume to database:', {
    name: resumeObject.name,
    jobId: resumeObject.jobId,
    recruiterId: resumeObject.recruiterId,
    managerId: resumeObject.managerId,
    tag: resumeObject.tag
  });

  const newResume = new Resume(resumeObject);
  const savedResume = await newResume.save();
  
  // Increment totalApplication_number for the job
  await Job.findByIdAndUpdate(job._id, { $inc: { totalApplication_number: 1 } });
  
  console.log('Resume saved successfully with ID:', savedResume._id);
  return savedResume;
};

// Extract folder ID from Google Drive link
const extractFolderIdFromLink = (link) => {
  const match = link.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// Extract file ID from Google Drive/Docs link
const extractFileIdFromLink = (link) => {
  // Google Drive file
  const driveMatch = link.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (driveMatch) return driveMatch[1];
  
  // Google Docs
  const docsMatch = link.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (docsMatch) return docsMatch[1];
  
  return null;
};

// Validate if URL is a valid Google Drive/Docs link
const isValidGoogleUrl = (url) => {
  const validPatterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/,
    /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/,
    /^https:\/\/drive\.google\.com\/open\?id=[a-zA-Z0-9-_]+/
  ];
  
  return validPatterns.some(pattern => pattern.test(url));
};

// Parse Google Sheets file (CSV/Excel)
const parseGoogleSheets = async (fileBuffer, fileType) => {
  try {
    let urls = [];
    
    if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
      // Parse CSV
      return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(fileBuffer);
        
        stream
          .pipe(csv())
          .on('data', (data) => {
            // Extract URLs from all columns
            Object.values(data).forEach(value => {
              if (typeof value === 'string' && isValidGoogleUrl(value.trim())) {
                results.push(value.trim());
              }
            });
          })
          .on('end', () => {
            resolve(results);
          })
          .on('error', reject);
      });
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
               fileType === 'application/vnd.ms-excel') {
      // Parse Excel
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract URLs from all cells
      data.forEach(row => {
        if (Array.isArray(row)) {
          row.forEach(cell => {
            if (typeof cell === 'string' && isValidGoogleUrl(cell.trim())) {
              urls.push(cell.trim());
            }
          });
        }
      });
      
      return urls;
    } else {
      // Parse as plain text (one URL per line)
      const text = fileBuffer.toString('utf-8');
      const lines = text.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && isValidGoogleUrl(trimmedLine)) {
          urls.push(trimmedLine);
        }
      });
      
      return urls;
    }
  } catch (error) {
    console.error('Error parsing Google Sheets file:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};

// Download file from Google Drive/Docs URL
const downloadFromGoogleUrl = async (url) => {
  try {
    const fileId = extractFileIdFromLink(url);
    if (!fileId) {
      throw new Error('Invalid Google Drive/Docs URL');
    }
    
    // Determine file type from URL
    let mimeType = 'application/pdf'; // default
    if (url.includes('/document/')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    if (drive) {
      // Use Google Drive API if available
      try {
        const response = await drive.files.get({
          fileId: fileId,
          alt: 'media'
        }, {
          responseType: 'stream'
        });
        
        // Convert stream to buffer
        const chunks = [];
        return new Promise((resolve, reject) => {
          response.data.on('data', chunk => chunks.push(chunk));
          response.data.on('end', () => resolve(Buffer.concat(chunks)));
          response.data.on('error', reject);
        });
      } catch (driveError) {
        console.error('Google Drive API error:', driveError.message);
        throw new Error(`Google Drive API error: ${driveError.message}`);
      }
    } else {
      // Use direct download method with multiple fallbacks
      const fallbackUrls = [
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://drive.google.com/file/d/${fileId}/preview`,
        `https://docs.google.com/document/d/${fileId}/export?format=pdf`
      ];
      
      for (const downloadUrl of fallbackUrls) {
        try {
          console.log(`Trying download URL: ${downloadUrl}`);
          const response = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            maxRedirects: 5,
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (response.data && response.data.length > 0) {
            console.log(`Successfully downloaded from: ${downloadUrl}`);
            return Buffer.from(response.data);
          }
        } catch (urlError) {
          console.log(`Failed to download from ${downloadUrl}:`, urlError.message);
          continue;
        }
      }
      
      throw new Error('All download methods failed. File may be private or not accessible.');
    }
  } catch (error) {
    console.error('Error downloading from Google URL:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

// Download file from Google Drive
const downloadFileFromDrive = async (fileId) => {
  const response = await drive.files.get({
    fileId: fileId,
    alt: 'media'
  }, {
    responseType: 'stream'
  });
  
  // Convert stream to buffer
  const chunks = [];
  return new Promise((resolve, reject) => {
    response.data.on('data', chunk => chunks.push(chunk));
    response.data.on('end', () => resolve(Buffer.concat(chunks)));
    response.data.on('error', reject);
  });
};

// Get files from public Google Drive folder
const getFilesFromPublicDrive = async (folderId) => {
  try {
    console.log('Attempting to access public Google Drive folder:', folderId);
    
    // For public folders, we'll try to extract file information from the folder
    // This is a simplified approach that works for most public folders
    const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
    
    // Return a structure that indicates this is a public folder
    // The frontend will handle the user experience
    return {
      isPublicFolder: true,
      folderId: folderId,
      folderUrl: folderUrl,
      message: "Public folder detected. Please download files manually and use folder upload."
    };
  } catch (error) {
    console.error('Error accessing public Google Drive folder:', error);
    throw new Error('Unable to access Google Drive folder. Please use the folder upload option.');
  }
};
