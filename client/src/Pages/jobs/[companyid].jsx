import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [newJob, setNewJob] = useState({
    jobtitle: '',
    description: '',
    location: '',
    salary: '',
    openpositions: '',
    skills: [],
    experience: { min: '', max: '' },
    internalNotes: '',
  });

  const navigate = useNavigate();
  const { id: companyId } = useParams();

  useEffect(() => {
    console.log("useeffect called");
    console.log("companyId:", companyId);
    if (!companyId) return;

    console.log('Fetching jobs for companyId:', companyId);

    const fetchJobs = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        console.log('companyId:', companyId);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/getjob?companyId=${companyId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userInfo.data.accessToken }`,
          },
        });

        const result = await response.json();
        console.log('API Response:', result);
        if (response.ok) {
          setJobs(result.jobs);
        } else {
          setError(result.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Error connecting to the backend');
      }
    };

    fetchJobs();
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'skills') {
      setNewJob((prev) => ({
        ...prev,
        skills: value.split(',').map((skill) => skill.trim()),
      }));
    } else if (name === 'experience.min') {
      setNewJob((prev) => ({
        ...prev,
        experience: {
          ...prev.experience,
          min: value,
        },
      }));
    } else if (name === 'experience.max') {
      setNewJob((prev) => ({
        ...prev,
        experience: {
          ...prev.experience,
          max: value,
        },
      }));
    } else {
      setNewJob((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const [editingJobId, setEditingJobId] = useState(null);

  const handleEditClick = (job) => {
    setEditingJobId(job._id);
    setNewJob({
      jobtitle: job.jobtitle,
      description: job.description,
      location: job.location,
      salary: job.salary,
      openpositions: job.openpositions,
      skills: job.skills,
      experience: { ...job.experience },
      internalNotes: job.internalNotes || '',
    });
  };

  const handleDeleteClick = async (jobId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/deletejob/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== jobId));
      } else {
        setError(result.message || 'Failed to delete job');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Error connecting to the backend');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      // Include companyId in the job data
      const jobData = { ...newJob, companyId: companyId };  // companyId from useParams()

      let url = `${import.meta.env.VITE_BACKEND_URL}/api/jobs/addjob`;
      let method = 'POST';

      if (editingJobId) {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/jobs/updatejob/${editingJobId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData), // Include companyId in the request body
      });

      const result = await response.json();

      if (response.ok) {
        if (method === 'PUT') {
          setJobs(jobs.map(job => job._id === editingJobId ? result.job : job));
        } else {
          setJobs([...jobs, result.job]);
        }

        setNewJob({
          jobtitle: '',
          description: '',
          location: '',
          salary: '',
          openpositions: '',
          skills: [],
          experience: { min: '', max: '' },
          internalNotes: '',
        });
        setEditingJobId(null);
      } else {
        setError(result.message || 'Failed to add/update job');
      }
    } catch (err) {
      console.error('Error adding/updating job:', err);
      setError('Error connecting to the backend');
    }
  };



  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Jobs at Company</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          name="jobtitle"
          value={newJob.jobtitle}
          onChange={handleChange}
          placeholder="Job Title"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <textarea
          name="description"
          value={newJob.description}
          onChange={handleChange}
          placeholder="Job Description"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="location"
          value={newJob.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="number"
          name="salary"
          value={newJob.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="number"
          name="openpositions"
          value={newJob.openpositions}
          onChange={handleChange}
          placeholder="Open Positions"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="skills"
          value={newJob.skills.join(', ')}
          onChange={handleChange}
          placeholder="Skills (comma separated)"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <div className="flex space-x-4">
          <input
            type="number"
            name="experience.min"
            value={newJob.experience.min}
            onChange={handleChange}
            placeholder="Min Experience"
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="number"
            name="experience.max"
            value={newJob.experience.max}
            onChange={handleChange}
            placeholder="Max Experience"
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <textarea
          name="internalNotes"
          value={newJob.internalNotes}
          onChange={handleChange}
          placeholder="Internal Notes (optional)"
          className="w-full p-2 rounded bg-gray-700 text-white min-h-[80px]"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-lg">
          Add Job
        </button>
      </form>
      {jobs.length > 0 ? (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job._id} className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold">{job.jobtitle}</h3>
              <p>{job.description}</p>
              <p>Location: {job.location}</p>
              <p>Salary: {job.salary}</p>
              <p>Open Positions: {job.openpositions}</p>
              <p>Skills: {job.skills.join(', ')}</p>
              <p>Experience: {job.experience.min} - {job.experience.max} years</p>
              <button
                onClick={() => handleEditClick(job)}
                className="mt-2 mr-2 px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(job._id)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
              <Link to={`/manager/company/jobs/${companyId}/${job._id}`}>
                <h2 className="p-2 bg-blue-500 text-white rounded-xl">
                  Assign Job
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs available for this company.</p>
      )}
    </div>
  );
};

export default Jobs;
