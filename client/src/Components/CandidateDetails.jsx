// components/CandidateDetails.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import React from "react";

const CandidateDetails = () => {
  const [scorecards, setScorecards] = useState([]);
  const { resumeId } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

 useEffect(() => {
  if (resumeId && userInfo?.data?.accessToken) {
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/candidates/${resumeId}`,
      {
        headers: {
          Authorization: `Bearer ${userInfo.data.accessToken}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setScorecards(data.scorecard)) // <- FIX HERE
      .catch((err) => console.error("Error fetching details:", err));
  }
}, [resumeId]);

console.log(scorecards)
  if (!scorecards || scorecards.length === 0)
    return <div className="p-4">No scorecards found.</div>;

  return (
    <div className="p-4 space-y-6">
      {scorecards.map((card, index) => {
        const { resume, answers, evaluatedAnswers, averageScore, feedback, isApproved, isRejected, rejectFeedback } = card;

        return (
          <div key={index} className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-bold mb-2">{resume.name}</h2>
            <p className="text-sm">Email: {resume.email_address}</p>
            <p className="text-sm">Location: {resume.location}</p>
            <p className="text-sm">ATS Score: {resume.ats_score}</p>

            <div className="mt-2 font-semibold text-sm">
              Final Scorecard (Average Score): {averageScore ?? "N/A"}
            </div>

            {isRejected && (
              <p className="text-red-600 mt-1">❌ Rejected: {rejectFeedback}</p>
            )}
            {isApproved && <p className="text-green-600 mt-1">✅ Approved</p>}

            <div className="mt-4">
              <h3 className="font-semibold">Answers:</h3>
              {answers?.length > 0 ? (
                <ul className="list-disc pl-4">
                  {answers.map((ans, i) => (
                    <li key={i}>
                      Answer {i + 1}: <strong>{ans}</strong>
                      {evaluatedAnswers?.[i]?.total !== undefined && (
                        <span className="ml-2 text-sm text-gray-600">
                          (Score: {evaluatedAnswers[i].total})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No answers available.</p>
              )}
            </div>

            {feedback && (
              <div className="mt-2">
                <h4 className="font-semibold">Feedback:</h4>
                <p>{feedback}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CandidateDetails;
