import React, { useState ,useEffect} from "react";
import { Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { Card, CardContent } from "./ui/Card";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Tesseract from "tesseract.js";
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
GlobalWorkerOptions.workerSrc = workerUrl;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

function ResumeParser() {
  const {jobid}=useParams();
  console.log("jobid",jobid);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState(null);
  const [aiLoading, setAILoading] = useState(false);
const [resumeId, setResumeId] = useState(null);
const navigate=useNavigate();
const { post } = useApi();
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.name.endsWith(".docx"))
    ) {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF or DOCX file");
    }
  };
useEffect(() => {
    if (resumeId) {
      console.log("✅ Updated resumeId:", resumeId);
    }
  }, [resumeId]);
  const saveResumeToDB = async (resumeData) => {
    try {
      const response = await post(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/save`,
        resumeData
      );

      const data = await response.json();
      console.log("✅ Resume saved:", data.resume._id);
      setResumeId(data.resume._id);
      
    } catch (error) {
      console.error("❌ Failed to save resume to database:", error.message);
    }
  };

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    setLoading(true);

    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      try {
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

        let fullText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        const resumeText = fullText.trim();
        if (resumeText.length < 50) {
          console.warn("Fallback to OCR due to low text content...");
          await runOCR(file);
          return;
        }

        setText(resumeText);
        const atsData = await fetchATSScore(resumeText);
        if (atsData) {
          await fetchFullResumeData(resumeText, atsData);
        }
      } catch (err) {
        console.error("Error extracting PDF text, falling back to OCR:", err);
        await runOCR(file);
      }

      setLoading(false);
    };

    fileReader.readAsArrayBuffer(file);
  };
  const runOCR = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = new Blob([reader.result], { type: file.type });

      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m) => console.log(m),
      });

      const ocrText = result.data.text.trim();
      setText(ocrText);
      const atsData = await fetchATSScore(resumeText);
      if (atsData) {
        await fetchFullResumeData(resumeText, atsData);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const extractTextFromDocx = async (file) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async function (event) {
        const arrayBuffer = event.target.result;
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        const resumeText = result.value.trim();
        setText(resumeText);
        const atsData = await fetchATSScore(resumeText);
        if (atsData) {
          await fetchFullResumeData(resumeText, atsData);
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading DOCX file:", error);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      if (file.type === "application/pdf") {
        extractTextFromPDF(file);
      } else if (file.name.endsWith(".docx")) {
        extractTextFromDocx(file);
      } else {
        alert("Unsupported file format");
      }
    }
  };

  const fetchATSScore = async (resumeText) => {
    setAILoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
      You are an advanced, non-repetitive AI-based ATS evaluator designed to perform **accurate and diverse scoring** of resumes.
      
      You must calculate the ATS score out of 100 using the following weighted criteria:
      {
        "Skill Match (Contextual)": 30,
        "Experience Relevance & Depth": 25,
        "Project & Achievement Validation": 15,
        "AI-Generated Resume Detection": 5,
        
        "Consistency Check": 15,
        "Resume Quality Score": 5,
        "Interview & Behavioral Prediction": 5,
        "Competitive Fit & Market Standing": 5
      }
      
      ### Strict Scoring Guidelines:
      1. **Each component must be scored individually**, even if a section is missing.
      2. **Avoid giving similar ATS scores across different resumes**. Add randomness based on realistic market variance and industry fit.
      3. Provide **subtle deductions** for missing details or vague wording.
      4. Do **not round up scores** unnecessarily; decimal values are encouraged (e.g., 82.5, 76.3).
      5. Use **clear judgment** for vague or overly templated resumes – do not favor verbosity.
      6. Your final score must **reflect real-world industry expectations** for 2025 job markets, tech/non-tech roles, and resume standards.
      
      Return ONLY a **JSON object** like this (no markdown, no code formatting):
      {
        "ats_score": number, // float with one decimal point (e.g., 76.8)
        "reason": string // Reasoning with 1-2 lines referencing specific scoring areas
      }
      
      Resume text:
      ${resumeText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = await response.text();
      const cleanedText = aiText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      setAIResponse((prev) => ({
        ...prev,
        ats_score: parsed.ats_score,
        ats_reason: parsed.reason,
      }));

      return {
        ats_score: parsed.ats_score,
        ats_reason: parsed.reason,
      };
    } catch (err) {
      console.error(err);
      setAIResponse({ error: "Error retrieving ATS score." });
      return null;
    } finally {
      setAILoading(false);
    }
  };

  const fetchFullResumeData = async (resumeText, atsData = {}) => {
    setAILoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an intelligent resume parser and analyzer.

Parse the resume text below and return a JSON object in the following format (no markdown, no explanation, no code block):

{
  name,
  contact_number,
  email_address,
  location,
  skills, // top 10 relevant technical skills
  education,
  work_experience,
  certifications,
  languages,
  suggested_resume_category,
  recommended_job_roles,
  number_of_job_jumps,
  average_job_duration_months
}

Instructions:
- "skills": Extract and return only the top 10 most relevant technical skills based on frequency and context. Avoid soft skills or generic terms.
- "number_of_job_jumps": Count the number of times the candidate switched jobs. If only one job is listed, return 0.
- "average_job_duration_months": Calculate average job duration in months using available start and end dates. If a job is marked "Present", use the current month (assume it's April 2025).
- Return numerical values for "number_of_job_jumps" and "average_job_duration_months", even if estimation is needed.
- Use float values (e.g., 9.0, 15.5) for "average_job_duration_months".

Resume text:
${resumeText}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = await response.text();
      const cleanedText = aiText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      const fullResumeData = {
        ...parsed,
        ...atsData, // ⬅️ inject ats_score and ats_reason
        raw_text: resumeText,
      };

      setAIResponse((prev) => ({ ...prev, ...parsed, ...atsData }));
      await saveResumeToDB(fullResumeData);
    } catch (err) {
      console.error(err);
      setAIResponse({ error: "Error retrieving full resume analysis." });
    } finally {
      setAILoading(false);
    }
  };

  const renderList = (data, fallback = "N/A") => {
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {data.map((item, index) => (
            <li key={index}>
              {typeof item === "object" ? JSON.stringify(item) : item}
            </li>
          ))}
        </ul>
      );
    }

    if (data === undefined || data === null || data === "N/A") {
      return <p>{fallback}</p>;
    }

    return <p>{typeof data === "object" ? JSON.stringify(data) : data}</p>;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-center">Resume Parser</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading || aiLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading || aiLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin" /> Processing...
                </span>
              ) : (
                "Upload & Analyze"
              )}
            </button>
          </form>
        </CardContent>
      </Card>

      {aiResponse && !aiResponse.error && (
        <Card className="w-full max-w-4xl mt-6">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">ATS Score</h3>
              {renderList(aiResponse.ats_score)}
              <h3 className="text-sm text-gray-600 mt-1">
                {aiResponse.ats_reason}
              </h3>
              <h3 className="text-lg font-semibold mt-4">Name</h3>
              {renderList(aiResponse.name)}
              <h3 className="text-lg font-semibold mt-4">Contact Number</h3>
              {renderList(aiResponse.contact_number)}
              <h3 className="text-lg font-semibold mt-4">Email Address</h3>
              {renderList(aiResponse.email_address)}
              <h3 className="text-lg font-semibold mt-4">Location</h3>
              {renderList(aiResponse.location)}
            </div>

            <div>
              <h3 className="text-lg font-semibold">Skills</h3>
              {renderList(aiResponse.skills)}
              <h3 className="text-lg font-semibold mt-4">
                Non-Technical Skills
              </h3>
              {renderList(aiResponse.non_technical_skills)}
              <h3 className="text-lg font-semibold mt-4">Education</h3>
              {renderList(aiResponse.education)}
              <h3 className="text-lg font-semibold mt-4">Work Experience</h3>
              {renderList(aiResponse.work_experience)}
              <h3 className="text-lg font-semibold mt-4">Certifications</h3>
              {renderList(aiResponse.certifications)}
              <h3 className="text-lg font-semibold mt-4">Languages</h3>
              {renderList(aiResponse.languages)}
              <h3 className="text-lg font-semibold mt-4">
                Suggested Resume Category
              </h3>
              {renderList(aiResponse.suggested_resume_category)}
              <h3 className="text-lg font-semibold mt-4">
                Recommended Job Roles
              </h3>
              {renderList(aiResponse.recommended_job_roles)}
              <h3 className="text-lg font-semibold mt-4">
                Number of Job Jumps
              </h3>
              {renderList(aiResponse.number_of_job_jumps, "0")}
              <h3 className="text-lg font-semibold mt-4">
                Average Job Duration (months)
              </h3>
              {renderList(aiResponse.average_job_duration_months, "0")}
            </div>
          </CardContent>
        </Card>
      )}

      {aiResponse?.error && (
        <Card className="w-full max-w-xl mt-6">
          <CardContent>
            <h3 className="text-lg font-semibold text-red-600">
              {aiResponse.error}
            </h3>
          </CardContent>
        </Card>
      )}
    {aiResponse && !aiResponse.error && !loading && !aiLoading && (
  <div className="w-full max-w-xl mt-6 flex justify-end">
    <button
      onClick={() => navigate(`/job/${jobid}/${resumeId}`)}
      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
    >
      Next
    </button>
  </div>
)}

    </div>
  );
}

export default ResumeParser;
