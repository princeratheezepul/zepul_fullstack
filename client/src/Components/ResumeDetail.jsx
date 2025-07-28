import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

function ResumeDetail() {
  const { resumeid:resumeId } = useParams();
  const {jobid:jobId}=useParams();
  const [resume, setResume] = useState(null);
  const [manualScore, setManualScore] = useState("");
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [manualQuestion, setManualQuestion] = useState("");
  const [topSkills, setTopSkills] = useState([]);
  const [score, setScore] = useState(null);
  const [skillScores, setSkillScores] = useState([]);
  const [loadingScore, setLoadingScore] = useState(false);
  const userInfo = localStorage.getItem("userInfo");
  const userId=userInfo?.data?.user?._id;
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeId}`
        );
        const data = await response.json();
        setResume(data);

        if (data) {
          const skillsToUse = await fetchTopSkillsUsingAI(data);
          setTopSkills(skillsToUse);
          await fetchAIQuestions(skillsToUse);
        }
      } catch (err) {
        console.error("Failed to fetch resume detail:", err);
      }
    };
    fetchResume();
  }, [resumeId]);

  const fetchAIQuestions = async (skills) => {
    setLoadingQuestions(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate five unique and realistic interview questions for the job role: Full Stack Developer, considering the following skills: ${skills.join(",")}.\nMake the questions relevant to real-world tasks and challenges.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      const rawLines = text.split("\n").filter(line => line.trim() !== "");
      const parsedQuestions = rawLines.map(line => line.replace(/^\d+\.\s*/, "")).filter(q => q.length > 0);
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error("Error generating AI questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchTopSkillsUsingAI = async (resume) => {
    if (!resume) {
      console.warn("No resume data provided for skill extraction.");
      return [];
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
Extract the top 5 most relevant technical skills from the following resume data for the job role "Full Stack Developer".
Respond with a comma-separated list only:
Resume Data:
${JSON.stringify(resume)}
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      const skillsArray = text.split(",").map(skill => skill.trim()).filter(skill => skill);
      return skillsArray.slice(0, 5);
    } catch (err) {
      console.error("Error fetching top skills from Gemini:", err);
      return [];
    }
  };

  const handleNext = async () => {
    if (page === 1 && resume?.skills?.length) {
      await fetchAIQuestions(resume.skills);
      setPage(2);
    } else if (page === 2) {
      setPage(3);
    } else if (page === 3) {
      setPage(4);
    }
  };

  const handlePrev = () => {
    if (page === 2) setPage(1);
    else if (page === 3) setPage(2);
    else if (page === 4) setPage(3);
  };

  const handleAddQuestion = () => {
    if (manualQuestion.trim()) {
      setQuestions(prev => [...prev, manualQuestion.trim()]);
      setManualQuestion("");
    }
  };

  const handleAnswerChange = (index, answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = answer;
    setAnswers(updatedAnswers);
  };

  const handleSubmitAnswers = async () => {
    console.log("button clicked");
    let totalScore = 0;
    const updatedSkillScores = topSkills.map(skill => ({ skill, score: 0 }));

    try {
      setLoadingScore(true);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const skillPrompt = `
      Extract the top 5 most relevant technical skills from the following resume data for the job role "Full Stack Developer".
      Respond with a comma-separated list only:
      Resume Data:
      ${JSON.stringify(resume)}`;

      const skillResult = await model.generateContent(skillPrompt);
      const skillText = await skillResult.response.text();
      const skillsArray = skillText.split(",").map(skill => skill.trim()).filter(Boolean).slice(0, 5);

      const evaluatedAnswers = await Promise.all(answers.map(async (answer, index) => {
        if (!answer || answer.length < 10) return { type: null, scores: [], total: 0 };

        const evalPrompt = `
        You are an interviewer assessing a candidate for the Full Stack Developer role.
        Evaluate the following response and provide a JSON output with:
        - type: either "technical", "practical", or "challenge"
        - scores:if the question is technical, provide a score for each skill in the format: terminology used:20% ,process explained:30%,tool usage accuracy :30% and logical flow :20% ...... else if the question is practical, provide a score for each skill in the format: problem solution clarity:40% ,relevance to job context:30%,outcome and results shared :30% ...... else if the question is challenge, provide a score for each skill in the format: depth of explaination:40% ,real world applicability:30%,confidence in response :30%
        - total: weighted average score

        Response:
        "${answer}"`;

        const evalResult = await model.generateContent(evalPrompt);
        const evalText = await evalResult.response.text();
        console.log("AI evaluation result:", evalText);

        try {
          const cleanedEvalText = evalText.replace(/```json|```/g, '').trim();
          console.log("Cleaned eval text:", cleanedEvalText);

          const parsed = JSON.parse(cleanedEvalText);
          if (parsed && parsed.type && parsed.scores && parsed.total !== undefined) {
            return parsed;
          } else {
            console.warn("Invalid structure in AI response, returning default format.");
            return { type: null, scores: [], total: 0 };
          }
        } catch (parseErr) {
          console.warn("Parsing error in evaluation response, fallback to default format:", parseErr);
          return { type: null, scores: [], total: 0 };
        }
      }));

      totalScore = evaluatedAnswers.reduce((sum, answer) => sum + (answer.total || 0), 0);
      const averageScore = evaluatedAnswers.length ? Math.floor(totalScore / evaluatedAnswers.length) : 0;

      const skillScorePrompt = `
      Given the following top skills: ${skillsArray.join(", ")}

      Based on this candidate's answers:
      ${answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n\n")}

      Evaluate each skill on a scale of 0 to 100 and respond with a JSON array like based on the previous answers given by the candidate:
      [
        { "skill": "JavaScript", "score": 0 },
        ...
      ]`;

      const skillScoreResult = await model.generateContent(skillScorePrompt);
      const skillScoreText = await skillScoreResult.response.text();
      console.log("Skill score result:", skillScoreText);

      let finalSkillScores = updatedSkillScores;
      try {
        let cleanedSkillScoreText = skillScoreText.replace(/```json|```/g, '').trim();
        console.log("Cleaned skill score text:", cleanedSkillScoreText);

        const jsonStart = cleanedSkillScoreText.indexOf('[');
        const jsonEnd = cleanedSkillScoreText.lastIndexOf(']');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedSkillScoreText = cleanedSkillScoreText.substring(jsonStart, jsonEnd + 1);
        }

        console.log("Final cleaned skill score text:", cleanedSkillScoreText);

        const parsedSkillScores = JSON.parse(cleanedSkillScoreText);

        if (Array.isArray(parsedSkillScores) && parsedSkillScores.every(item => item.skill && typeof item.score === 'number')) {
          finalSkillScores = skillsArray.map(skill => {
            const match = parsedSkillScores.find(item => item.skill.toLowerCase() === skill.toLowerCase());
            return { skill, score: match ? match.score : 0 };
          });
        } else {
          console.warn("Invalid structure in skill score response, fallback to default scores.");
        }
      } catch (err) {
        console.warn("Skill score parsing failed, keeping scores at 0.", err);
      }

      setScore(averageScore);
      setSkillScores(finalSkillScores);

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scorecard/save-scorecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId: resume.userId || "anonymous", // or however you identify user
          jobId,
          resume,
          answers,
          averageScore,
          skillScores: finalSkillScores,
          evaluatedAnswers
        })
      });

      setPage(4);
    } catch (err) {
      console.error("Error processing with Gemini AI:", err);
      setScore(0);
      setSkillScores(updatedSkillScores);
    } finally {
      setLoadingScore(false);
    }
  };
const [isApproved, setIsApproved] = useState(false);
  const [requestAnotherRound, setRequestAnotherRound] = useState(false);

useEffect(() => {
  const fetchStatus = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeId}`);
    const data = await res.json();
    setIsApproved(data.isApproved);
    setRequestAnotherRound(data.requestAnotherRound);
  };

  if (resumeId) {
    fetchStatus();
  }
}, [resumeId]);



  const renderSection = (title, content) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {Array.isArray(content) ? (
        <ul className="list-disc list-inside">
          {content.map((item, idx) => (
            <li key={idx}>{typeof item === "object" ? JSON.stringify(item) : item}</li>
          ))}
        </ul>

      ) : (
        <p>{typeof content === "object" ? JSON.stringify(content) : content}</p>
      )}
    </div>
  );

  if (!resume) return <p className="p-6">Loading resume...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow transition-all duration-500">
      {page === 1 && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-4">Resume Detail</h2>
          {renderSection("Name", resume.name)}
          {renderSection("Email Address", resume.email_address)}
          {renderSection("Location", resume.location)}

          {topSkills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Top 5 Relevant Skills</h3>
              <ul className="list-disc pl-5">
                {topSkills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {renderSection("Non-Technical Skills", resume.non_technical_skills)}
          {renderSection("Education", resume.education)}
          {renderSection("Work Experience", resume.work_experience)}
          {renderSection("Certifications", resume.certifications)}
          {renderSection("Languages", resume.languages)}
          {renderSection("Suggested Resume Category", resume.suggested_resume_category)}
          {renderSection("Recommended Job Roles", resume.recommended_job_roles)}
          {renderSection("Number of Job Jumps", resume.number_of_job_jumps)}
          {renderSection("Average Job Duration (months)", resume.average_job_duration_months)}
          {renderSection("ATS Score", resume.ats_score)}
          {renderSection("ATS Reason", resume.ats_reason)}

          <div className="mt-6 text-right">
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {page === 2 && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-4">AI-Generated Interview Questions</h2>
          {loadingQuestions ? (
            <p>Loading questions...</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2 mb-4">
              {questions.map((q, index) => (
                <li key={index}>{q}</li>
              ))}
            </ul>
          )}

          <div className="mb-4">
            <input
              type="text"
              placeholder="Add your own question..."
              className="border border-gray-300 px-4 py-2 rounded w-full mb-2"
              value={manualQuestion}
              onChange={(e) => setManualQuestion(e.target.value)}
            />
            <button
              onClick={handleAddQuestion}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Question
            </button>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handlePrev}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {page === 3 && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-4">Answer the Interview Questions</h2>
          {questions.map((question, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{question}</p>
              <textarea
                className="border border-gray-300 px-4 py-2 rounded w-full mb-2"
                rows={4}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                value={answers[index] || ""}
                placeholder="Your answer..."
              />
            </div>
          ))}

          <div className="mt-6 text-right">
            <button
              onClick={handleSubmitAnswers}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Answers
            </button>
          </div>
        </div>
      )}

      {page === 4 && (
  <div className="animate-fadeIn mt-6">
    {loadingScore && <p>Evaluating your answers, please wait...</p>}

    <h3 className="text-2xl font-bold mb-4">Score & Skills Breakdown</h3>
    <p className="mb-2">Total Score: {score}</p>

    <div>
      {skillScores.map((skill, idx) => (
        <div key={idx} className="mb-2">
          <p>{skill.skill}: {skill.score}%</p>
        </div>
      ))}
    </div>

    <div className="mt-6 space-y-3">
      {/* ✅ Show status if already requested or submitted */}
      {isApproved ? (
        <p className="text-green-600 font-semibold">✅ Submitted to Manager</p>
      ) : requestAnotherRound ? (
        <p className="text-yellow-600 font-semibold">🔁 Another Round Requested</p>
      ) : (
        <>
          {/* 🚀 Submit to Manager Button */}
          <button
            onClick={async () => {
              try {
                await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/submit-to-manager`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    resumeId,
                    isApproved: true,
                    emailSent: false,
                  }),
                });
                alert("Submitted to manager successfully.");
              } catch (err) {
                console.error("Error submitting to manager:", err);
                alert("Failed to submit. Please try again.");
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit to Manager
          </button>

          {/* 🎯 Request Another Round Button */}
          <button
            onClick={async () => {
              try {
                await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/reqanotherround`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    resumeId,
                    requestAnotherRound: true,
                    userId,
                  }),
                });
                alert("Another round requested.");
              } catch (err) {
                console.error("Error requesting another round:", err);
                alert("Failed to request. Please try again.");
              }
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Request Another Round
          </button>
        </>
      )}
    </div>
  </div>
)}


    </div>
  );
}

export default ResumeDetail;
