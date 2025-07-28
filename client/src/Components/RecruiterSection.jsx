import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RecruiterSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/search?role=${searchTerm}`
      );
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Search Resumes by Role</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="e.g. Frontend Developer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      <div className="grid gap-4">
        {resumes.length === 0 ? (
          <p>No resumes found for this role.</p>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume._id}
              onClick={() => navigate(`/recruiter/${resume._id}`)}
              className="border p-4 rounded shadow bg-white cursor-pointer hover:bg-gray-50"
            >
              <h3 className="text-xl font-semibold">{resume.name}</h3>
              <p><strong>Email:</strong> {resume.email_address}</p>
              <p><strong>Location:</strong> {resume.location}</p>
              <p><strong>Skills:</strong> {resume.skills?.join(", ")}</p>
              <p><strong>Job Roles:</strong> {resume.recommended_job_roles?.join(", ")}</p>
              <p><strong>ATS Score:</strong> {resume.ats_score}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecruiterSection;

