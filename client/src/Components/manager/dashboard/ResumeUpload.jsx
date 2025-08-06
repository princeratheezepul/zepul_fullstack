import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ArrowLeft, Loader2 } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import ResumeDetailsView from './ResumeDetailsView';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';

GlobalWorkerOptions.workerSrc = workerUrl;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

const ResumeUpload = ({ onBack, jobDetails }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { post } = useApi();

  // Test authentication function
  const testAuth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/test-auth`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Auth test result:', data);
      return data;
    } catch (error) {
      console.error('Auth test failed:', error);
      return null;
    }
  };

  // Test authentication on component mount
  useEffect(() => {
    testAuth();
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setLoadingMessage("Extracting text from resume...");

    try {
      let text = "";
      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else if (file.name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        text = await extractTextFromDocx(file);
      } else {
        throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
      }

      setLoadingMessage("Analyzing resume with AI...");
      const analysis = await analyzeResume(text, jobDetails);
      
      setLoadingMessage("Calculating ATS Score...");
      const atsResult = await fetchATSScore(text);

      const finalData = { 
        ...analysis, 
        overallScore: Math.round(atsResult.ats_score),
        ats_score: atsResult.ats_score,
        ats_reason: atsResult.ats_reason
      };

      setLoadingMessage("Saving details...");
      const saved = await saveResumeToDB(finalData, jobDetails.jobId);
      setParsedData(saved.resume); // Use the DB object with _id

    } catch (error) {
      console.error("Error processing resume:", error);
      alert(error.message || "Failed to process the resume.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }, [jobDetails]);

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        try {
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = "";
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            fullText += content.items.map((item) => item.str).join(" ");
          }
          resolve(fullText);
        } catch (err) {
            console.error("Error extracting PDF text, falling back to OCR:", err);
            // Fallback to OCR can be implemented here if needed
            reject("Failed to read PDF.");
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromDocx = async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
  };

  const saveResumeToDB = async (resumeData, jobId) => {
    try {
      console.log('Saving resume data:', resumeData);
      console.log('JobId:', jobId);
      console.log('API URL:', `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/save/${jobId}`);
      
      // Debug: Check if user is authenticated
      const userInfo = localStorage.getItem('userInfo');
      const authToken = localStorage.getItem('authToken');
      console.log('User info from localStorage:', userInfo);
      console.log('Auth token from localStorage:', authToken);
      console.log('AuthContext user:', user);
      console.log('AuthContext isAuthenticated:', isAuthenticated);
      
      // Debug: Check cookies
      console.log('All cookies:', document.cookie);
      
      // Try direct fetch with proper credentials
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/save/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Try Authorization header
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(resumeData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        let errorMessage = 'Failed to save resume data';
        
        try {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON (like HTML error page), get the text
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Resume saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw new Error(`Failed to save resume data to database: ${error.message}`);
    }
  };

  const fetchATSScore = async (resumeText) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
      You are a strict, realistic ATS evaluator. Calculate ATS score out of 100 using weighted criteria below. BE CONSERVATIVE with scoring - most resumes should score 60-80, with only exceptional candidates scoring 85+.

      Weighted criteria and STRICT scoring guidelines:
      {
        "Skill Match & Technical Competency": 30
        // 25-30: Diverse, in-demand technical skills, clear expertise
        // 20-24: Good technical skills, some specialization
        // 15-19: Basic technical skills, limited depth
        // 10-14: Few relevant skills, mostly generic
        // 0-9: Poor/outdated skills, no clear technical focus

        "Experience Quality & Depth": 25
        // 22-25: Senior level, clear progression, impressive roles
        // 18-21: Mid-level, good progression, relevant roles
        // 14-17: Entry-mid level, some progression
        // 10-13: Entry level or limited progression
        // 0-9: No relevant experience or major gaps

        "Project & Achievement Validation": 15
        // 13-15: Quantified achievements, impressive projects
        // 10-12: Some quantified results, good projects
        // 7-9: Basic project mentions, few metrics
        // 4-6: Vague projects, no quantification
        // 0-3: No meaningful projects/achievements

        "Consistency & Career Progression": 15
        // 13-15: Stable career, logical upward progression
        // 10-12: Mostly stable, 1-2 short tenures
        // 7-9: Some job hopping, minor gaps
        // 4-6: Frequent changes, employment gaps
        // 0-3: Major inconsistencies, many gaps

        "Resume Quality & Professional Presentation": 10
        // 9-10: Excellent format, clear structure, professional
        // 7-8: Good format, well-organized
        // 5-6: Average format, some unclear sections
        // 3-4: Poor format, hard to follow
        // 0-2: Very poor quality, unprofessional

        "Communication & Leadership Indicators": 5
        // 5: Strong leadership examples, excellent communication
        // 3-4: Good professional indicators
        // 1-2: Basic communication skills evident
        // 0: Poor or no communication indicators
      }

      CRITICAL SCORING RULES:
      - Most resumes should score 60-75 total (industry reality)
      - Scores of 85+ should be RARE (top 10% of candidates)
      - Scores of 90+ should be EXTREMELY RARE (top 2-3%)
      - Be harsh on: missing achievements, generic content, poor formatting, employment gaps
      - Heavily penalize: job hopping, vague descriptions, skill-experience mismatches
      - Focus on overall resume strength and professional presentation

      Return ONLY a JSON object with this exact structure:
      {
        "ats_score": number, // decimal value (e.g., 67.5, 73.2)
        "ats_reason": string // 1-2 lines explaining the score with specific weaknesses/strengths
      }
      
      ### Resume Text to Evaluate:
      ${resumeText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from AI");
      }
      
      const atsResult = JSON.parse(jsonMatch[0]);
      return atsResult;
    } catch (error) {
      console.error("Error fetching ATS score:", error);
      // Return a default score if AI fails
      return {
        ats_score: 75,
        ats_reason: "Default score due to processing error"
      };
    }
  };

  const analyzeResume = async (resumeText, job) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
      Analyze this resume for the job position: ${job.jobtitle}
      
      Job Description: ${job.description}
      
      Resume Text: ${resumeText}
      
      Please provide a comprehensive analysis in the following JSON format:
      {
        "name": "[Full Name]",
        "email": "[Email Address]",
        "phone": "[Phone Number]",
        "location": "[Location/City]",
        "experience": "[Years of Experience]",
        "skills": ["skill1", "skill2", "skill3", ...],
        "education": ["degree1", "degree2", ...],
        "summary": "[Professional Summary]",
        "recommended_job_roles": ["role1", "role2", ...],
        "suggested_resume_category": "[category]",
        "overallScore": [score out of 100],
        "strengths": ["strength1", "strength2", ...],
        "weaknesses": ["weakness1", "weakness2", ...],
        "recommendations": ["recommendation1", "recommendation2", ...]
      }
      
      Guidelines:
      - Extract all relevant information accurately
      - Skills should be specific and relevant to the job
      - Experience should be in years (e.g., "5 years")
      - Overall score should reflect fit for the specific job
      - Strengths and weaknesses should be job-specific
      - Recommendations should be actionable
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from AI");
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      throw new Error("Failed to analyze resume with AI");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  if (parsedData) {
    return <ResumeDetailsView resumeData={parsedData} onBack={() => setParsedData(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Job Details
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Resume</h1>
            <p className="text-gray-600">Upload a resume for {jobDetails?.jobtitle || 'this position'}</p>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud size={48} className="mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the resume here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop a resume here, or <span className="text-blue-600 font-medium">click to browse</span>
                </p>
                <p className="text-sm text-gray-500">Supports PDF and DOCX files</p>
              </div>
            )}
          </div>

          {loading && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <Loader2 size={20} className="animate-spin text-blue-600" />
                <span className="text-blue-600 font-medium">{loadingMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload; 