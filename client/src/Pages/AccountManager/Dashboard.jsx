import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AccountManagerDashboard = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      if (!user?.id) {
        setError("User not logged in");
        return;
      }

      const [recruiterRes, jobRes, companyRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getallrecruiters`, {
          credentials: "include",
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/getjob`, {
          credentials: "include",
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany`, {
          credentials: "include",
        }),
      ]);

      const recruiterData = await recruiterRes.json();
      if (recruiterData?.recruiters) setRecruiters(recruiterData.recruiters);
      else setError("Failed to fetch recruiters");

      const jobData = await jobRes.json();
      if (jobData?.jobs) setJobs(jobData.jobs.filter(c => c.isActive));
      else setError("Failed to fetch jobs");

      const companyData = await companyRes.json();
      if (companyData?.companies) {
        setCompanies(companyData.companies);
      } else setError("Failed to fetch companies");

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Server error");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);


  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Jobs Posted by You</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {companies.map((company) => {
        const companyJobs = jobs.filter(
          (job) => job.companyId === company._id && job.isActive
        );

        if (companyJobs.length === 0) return null;

        return (
          <div key={company._id} className="mb-6">
            <h2 className="text-xl font-bold mb-2 border-b border-gray-500 pb-1">{company.name}</h2>
            <ul className="space-y-4">
              {companyJobs.map((job) => {
                const unassignedRecruiters = recruiters.filter(
                  (r) => !job.assignedTo?.includes(r._id)
                );

                return (
                  <li key={job._id} className="p-4 bg-gray-700 rounded">
                    <h3 className="text-lg font-bold">{job.jobtitle}</h3>
                    <p><strong>Description:</strong> {job.description}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Salary:</strong> ₹{job.salary}</p>
                    <p><strong>Open Positions:</strong> {job.openpositions}</p>
                    <p><strong>Skills:</strong> {job.skills.join(", ")}</p>
                    <p><strong>Experience:</strong> {job.experience?.min} - {job.experience?.max} years</p>
                    <p><strong>Assigned To:</strong> {job.assignedTo?.map(id =>
                      recruiters.find(r => r._id === id)?.email || "Unknown"
                    ).join(", ") || "None"}</p>
                    <p><strong>Status:</strong> Active</p>

                    

                   
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default AccountManagerDashboard;
