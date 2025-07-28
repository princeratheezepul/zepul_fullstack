import { useEffect, useState } from "react";
import CandidateList from "../../../Components/CandidateList";
import CandidateDetails from "../../../Components/CandidateDetails";

const AccountManagerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [error, setError] = useState("");

  const userInfo = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userInfo")) : null;

  const fetchData = async () => {
    try {
      if (!userInfo?.data?.user?._id) {
        setError("Admin not logged in");
        return;
      }

      const [jobRes, recruiterRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/getjob`, {
          headers: { Authorization: `Bearer ${userInfo.data.accessToken}` },
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getallrecruiters`, {
          headers: { Authorization: `Bearer ${userInfo.data.accessToken}` },
        }),
      ]);

      const jobData = await jobRes.json();
      const recruiterData = await recruiterRes.json();

      if (jobData?.jobs) setJobs(jobData.jobs);
      else setError("Failed to fetch jobs");

      if (recruiterData?.recruiters) setRecruiters(recruiterData.recruiters);
      else setError("Failed to fetch recruiters");

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Server error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAssignedRecruiters = (assignedTo) => {
    return assignedTo
      ?.map(id => recruiters.find(r => r._id === id)?.email || "Unknown")
      .join(", ");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Jobs Posted by You</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          <ul className="space-y-4">
            {jobs.map(job => (
              <li key={job._id} className="p-4 bg-gray-700 rounded">
                <h3 className="text-lg font-bold">{job.jobtitle}</h3>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Salary:</strong> ₹{job.salary}</p>
                <p><strong>Open Positions:</strong> {job.openpositions}</p>
                <p><strong>Skills:</strong> {job.skills.join(", ")}</p>
                <p><strong>Experience:</strong> {job.experience?.min} - {job.experience?.max} years</p>
                <p><strong>Status:</strong> {job.isActive ? "Active" : "Inactive"}</p>
                <p><strong>Assigned To:</strong> {getAssignedRecruiters(job.assignedTo)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <CandidateList/>
    </div>
  );
};

export default AccountManagerJobs;
