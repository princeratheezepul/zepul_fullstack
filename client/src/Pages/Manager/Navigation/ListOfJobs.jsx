import { useEffect, useState } from "react";

const ListOfJobs = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    jobtitle: "",
    description: "",
    location: "",
    salary: "",
    openpositions: "",
    company: "",
    hiringDeadline: "",
    skills: [],
    experience: { min: "", max: "" },
    managerId: "",
    recruiterId: "",
    internalNotes: ""
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const fetchData = async () => {
    try {
      if (!userInfo?.data?.user?._id) {
        setError("Manager not logged in");
        return;
      }


      const managerId = userInfo.data.user._id;

      const [recruiterRes, jobRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager`, {
          headers: { 'Authorization': `Bearer ${userInfo.data.accessToken}` }
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/get-jobs/${managerId}`, {
          headers: { 'Authorization': `Bearer ${userInfo.data.accessToken}` }
        })
      ]);

      const recruiterData = await recruiterRes.json();
      const jobData = await jobRes.json();

      if (recruiterData?.recruiters) setRecruiters(recruiterData.recruiters);
      else setError("Failed to fetch recruiters");

      if (jobData?.success) setJobs(jobData.jobs);
      else setError("Failed to fetch jobs");

      setFormData(prev => ({ ...prev, managerId }));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Server error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "skills") {
      setFormData(prev => ({
        ...prev,
        skills: value.split(",").map(skill => skill.trim())
      }));
    } else if (name.startsWith("experience.")) {
      setFormData(prev => ({
        ...prev,
        experience: {
          ...prev.experience,
          [name.split(".")[1]]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate hiring deadline
    if (formData.hiringDeadline) {
      const deadlineDate = new Date(formData.hiringDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      if (deadlineDate <= today) {
        alert("Hiring deadline must be greater than today's date");
        return;
      }
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/create-job`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        alert("Job created successfully");
        setFormData({
          jobtitle: "",
          description: "",
          location: "",
          salary: "",
          openpositions: "",
          company: "",
          hiringDeadline: "",
          skills: [],
          experience: { min: "", max: "" },
          managerId: formData.managerId,
          recruiterId: "",
          internalNotes: ""
        });
        fetchData(); // Refresh job list
      } else {
        alert(data.message || "Failed to create job");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Something went wrong.");
    }
  };

 const handleAssignRecruiter = async (jobId, recruiterId) => {
  try {
    if (!recruiterId) return;

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/assign-recruiter/${jobId}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${userInfo.data.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ recruiterId })  // only recruiterId
    });

    const data = await res.json();
    if (data.success) {
      alert("Recruiter assigned successfully");
      fetchData(); // Refresh data
    } else {
      alert(data.message || "Failed to assign recruiter");
    }
  } catch (err) {
    console.error("Error assigning recruiter:", err);
    alert("Something went wrong.");
  }
};
console.log(jobs)

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="text-2xl font-bold mb-6 text-center">Create New Job</div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="jobtitle" value={formData.jobtitle} onChange={handleChange} placeholder="Job Title" required className="w-full p-2 rounded bg-gray-700" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 rounded bg-gray-700" />
        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required className="w-full p-2 rounded bg-gray-700" />
        <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Salary" required className="w-full p-2 rounded bg-gray-700" />
        <input name="openpositions" type="number" value={formData.openpositions} onChange={handleChange} placeholder="Open Positions" required className="w-full p-2 rounded bg-gray-700" />
        <input name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" className="w-full p-2 rounded bg-gray-700" />
        <input name="hiringDeadline" type="date" value={formData.hiringDeadline} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full p-2 rounded bg-gray-700" />
        <input name="skills" value={formData.skills.join(", ")} onChange={handleChange} placeholder="Skills (comma-separated)" required className="w-full p-2 rounded bg-gray-700" />

        <div className="flex gap-4">
          <input name="experience.min" type="number" value={formData.experience.min} onChange={handleChange} placeholder="Min Exp" required className="w-1/2 p-2 rounded bg-gray-700" />
          <input name="experience.max" type="number" value={formData.experience.max} onChange={handleChange} placeholder="Max Exp" required className="w-1/2 p-2 rounded bg-gray-700" />
        </div>

        <select name="recruiterId" value={formData.recruiterId} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700">
          <option value="">Select Recruiter</option>
          {recruiters.map(r => (
            <option key={r._id} value={r._id}>{r.email}</option>
          ))}
        </select>

        <textarea name="internalNotes" value={formData.internalNotes} onChange={handleChange} placeholder="Internal Notes (optional)" className="w-full p-2 rounded bg-gray-700 min-h-[80px]" />

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-semibold">
          Create Job
        </button>
      </form>

      <div className="mt-10">
        <div className="text-xl font-semibold mb-4">Jobs Posted by You</div>
        {jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          <ul className="space-y-4">
            {jobs.map(job => {
              const unassignedRecruiters = recruiters.filter(r => !job.assignedTo?.includes(r._id));

              return (
                <li key={job._id} className="p-4 bg-gray-700 rounded">
                  <div className="text-lg font-bold">{job.jobtitle}</div>
                  <p><strong>Description:</strong> {job.description}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> ₹{job.salary}</p>
                  <p><strong>Open Positions:</strong> {job.openpositions}</p>
                  <p><strong>Skills:</strong> {job.skills.join(", ")}</p>
                  <p><strong>Experience:</strong> {job.experience?.min} - {job.experience?.max} years</p>
                  <p><strong>Company:</strong> {job.company || "Not specified"}</p>
                  <p><strong>Hiring Deadline:</strong> {job.hiringDeadline ? new Date(job.hiringDeadline).toLocaleDateString() : "Not specified"}</p>
                  <p><strong>Assigned To:</strong> {job.assignedTo?.map(id => recruiters.find(r => r._id === id)?.email || "Unknown").join(", ") || "None"}</p>

                  {unassignedRecruiters.length > 0 && (
                    <div className="mt-2">
                      <select onChange={e => handleAssignRecruiter(job._id, e.target.value)} className="bg-gray-600 p-2 rounded text-white">
                        <option value="">Assign Recruiter</option>
                        {unassignedRecruiters.map(r => (
                          <option key={r._id} value={r._id}>{r.email}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ListOfJobs;
