import { useEffect, useState } from "react";

const AdminJobs = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState("");
    const [companies, setCompanies] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);

   

    const [formData, setFormData] = useState({
        jobtitle: "",
        description: "",
        location: "",
        salary: "",
        openpositions: "",
        skills: [],
        experience: { min: "", max: "" },
        adminId: "",
        recruiterId: "",
        companyId: "",
        internalNotes: ""
    });

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const fetchData = async () => {
        try {
            if (!userInfo?.data?.user?._id) {
                setError("Admin not logged in");
                return;
            }

            const adminId = userInfo.data.user._id;
            const [recruiterRes, jobRes, companyRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getrecruiterbyAdmin/${adminId}`, {
                    headers: { Authorization: `Bearer ${userInfo.data.accessToken}` }
                }),
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getjobs/${adminId}`, {
                    headers: { Authorization: `Bearer ${userInfo.data.accessToken}` }
                }),
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getcompany/${adminId}`, {
                    headers: { Authorization: `Bearer ${userInfo.data.accessToken}` }
                }),
            ]);

            const companyData = await companyRes.json();
            if (companyData?.company) setCompanies(companyData.company);
            else setError("Failed to fetch companies");

            const recruiterData = await recruiterRes.json();
            const jobData = await jobRes.json();
            if (recruiterData?.recruiter) setRecruiters(recruiterData.recruiter);
            else setError("Failed to fetch recruiters");

            if (jobData?.jobs) setJobs(jobData.jobs);
            else setError("Failed to fetch jobs");

            setFormData(prev => ({ ...prev, adminId }));
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

    const handleSubmit = async () => {
        try {
            console.log(editingJobId)
            const url = isEditing
                ? `${import.meta.env.VITE_BACKEND_URL}/api/admin/updatejob/${editingJobId}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/admin/createjob`;

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${userInfo.data.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                alert(isEditing ? "Job updated successfully" : "Job created successfully");
                setFormData({
                    jobtitle: "",
                    description: "",
                    location: "",
                    salary: "",
                    openpositions: "",
                    skills: [],
                    experience: { min: "", max: "" },
                    adminId: formData.adminId,
                    recruiterId: "",
                    companyId: "",
                    internalNotes: ""
                });
                setShowConfirmModal(false);
                setIsEditing(false);
                setEditingJobId(null);
                fetchData();
            } else {
                alert(data.message || "Failed to submit job");
            }
        } catch (err) {
            console.error("Error submitting job:", err);
            alert("Something went wrong.");
        }
    };


    const handleEdit = (job) => {
        setFormData({
            jobtitle: job.jobtitle,
            description: job.description,
            location: job.location,
            salary: job.salary,
            openpositions: job.openpositions,
            skills: job.skills,
            experience: job.experience || { min: "", max: "" },
            adminId: job.adminId,
            recruiterId: job.recruiterId || "",
            companyId: job.companyId || "",
            internalNotes: job.internalNotes || ""
        });
        setIsEditing(true);
        setEditingJobId(job._id);
    };


    const handleAssignRecruiter = async (jobId, recruiterId) => {
        try {
            if (!recruiterId) return;

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/assignrecruiter/${jobId}`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${userInfo.data.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ recruiterId })
            });

            const data = await res.json();
            if (data.success) {
                alert("Recruiter assigned successfully");
                fetchData();
            } else {
                alert(data.message || "Failed to assign recruiter");
            }
        } catch (err) {
            console.error("Error assigning recruiter:", err);
            alert("Something went wrong.");
        }
    };


    const handleToggleStatus = async (jobId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/togglejobstatus/${jobId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${userInfo.data.accessToken}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchData(); // Refresh job list
            } else {
                alert(data.message || "Failed to update job status");
            }
        } catch (err) {
            console.error("Error toggling job status:", err);
            alert("Something went wrong.");
        }
    };
    


    const handleDeleteJob = async (jobId) => {
        const confirmDelete = confirm("Are you sure you want to delete this job?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/deletejob/${jobId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${userInfo.data.accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            if (data.success) {
                alert("Job deleted successfully");
                fetchData(); // Refresh job list
            } else {
                alert(data.message || "Failed to delete job");
            }
        } catch (err) {
            console.error("Error deleting job:", err);
            alert("Something went wrong.");
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Create New Job</h1>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={e => { e.preventDefault(); setShowConfirmModal(true); }} className="space-y-4">

                <input name="jobtitle" value={formData.jobtitle} onChange={handleChange} placeholder="Job Title" required className="w-full p-2 rounded bg-gray-700" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 rounded bg-gray-700" />
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required className="w-full p-2 rounded bg-gray-700" />
                <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Salary" required className="w-full p-2 rounded bg-gray-700" />
                <input name="openpositions" type="number" value={formData.openpositions} onChange={handleChange} placeholder="Open Positions" required className="w-full p-2 rounded bg-gray-700" />
                <select name="companyId" value={formData.companyId} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700">
                    <option value="">Select Company</option>
                    {companies.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>

                <input name="skills" value={formData.skills.join(", ")} onChange={handleChange} placeholder="Skills (comma-separated)" required className="w-full p-2 rounded bg-gray-700" />

                <div className="flex gap-4">
                    <input name="experience.min" type="number" value={formData.experience.min} onChange={handleChange} placeholder="Min Exp" required className="w-1/2 p-2 rounded bg-gray-700" />
                    <input name="experience.max" type="number" value={formData.experience.max} onChange={handleChange} placeholder="Max Exp" required className="w-1/2 p-2 rounded bg-gray-700" />
                </div>

                <select name="recruiterId" value={formData.recruiterId} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700">
                    <option value="">Select Recruiter</option>
                    {recruiters.map(r => (
                        <option key={r._id} value={r._id}>{r.fullname} ({r.email})</option>
                    ))}
                </select>

                <textarea name="internalNotes" value={formData.internalNotes} onChange={handleChange} placeholder="Internal Notes (optional)" className="w-full p-2 rounded bg-gray-700 min-h-[80px]" />

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-semibold">
                    {isEditing ? "Update Job" : "Create Job"}
                </button>
            </form>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-6 rounded shadow-lg w-80">
                        <h3 className="text-lg font-semibold mb-4">Confirm Job Creation</h3>
                        <p>Are you sure you want to create this job?</p>
                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Jobs Posted by You</h2>
                {jobs.length === 0 ? (
                    <p>No jobs found.</p>
                ) : (
                    <ul className="space-y-4">
                        {jobs.map(job => {
                            const unassignedRecruiters = recruiters.filter(r => !job.assignedTo?.includes(r._id));
                            return (
                                <li key={job._id} className="p-4 bg-gray-700 rounded">
                                    <h3 className="text-lg font-bold">{job.jobtitle}</h3>
                                    <p><strong>Description:</strong> {job.description}</p>
                                    <p><strong>Location:</strong> {job.location}</p>
                                    <p><strong>Salary:</strong> ₹{job.salary}</p>
                                    <p><strong>Open Positions:</strong> {job.openpositions}</p>
                                    <p><strong>Skills:</strong> {job.skills.join(", ")}</p>
                                    <p><strong>Experience:</strong> {job.experience?.min} - {job.experience?.max} years</p>
                                    <p><strong>Assigned To:</strong> {job.assignedTo?.map(id => recruiters.find(r => r._id === id)?.email || "Unknown").join(", ") || "None"}</p>
                                    <p><strong>Company:</strong> {companies.find(c => c._id === job.companyId)?.name || "Unknown"}</p>
                                    <p><strong>Status:</strong> {job.isActive ? "Active" : "Inactive"}</p>
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
                                    <button
                                        onClick={() => handleEdit(job)}
                                        className="mt-3 px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(job._id)}
                                        className={`mt-3 ml-3 px-3 py-1 rounded ${job.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                            } text-white`}
                                    >
                                        {job.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <br></br>
                                    <button
                                        onClick={() => handleDeleteJob(job._id)}
                                        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                    <a
                    href={`/job/${job._id}`}
                    className="mt-2 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                    Submit Resume
                </a>

                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminJobs;
