import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Users, IndianRupee, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AdminSavedResumes from '../../../Components/admin/dashboard/AdminSavedResumes';

const AdminJobDetailPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const { jobid: jobId } = useParams();
  const [resumeCount, setResumeCount] = useState(0);
  const [showSavedResumes, setShowSavedResumes] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/job/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job data');
      }

      const data = await response.json();
      console.log('Fetched job data:', data.job);
      setJobData(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch resume count for this job
  const fetchResumeCount = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/resumes/job/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      setResumeCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setResumeCount(0);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchResumeCount();
    }
  }, [jobId]);

  // Function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Job data with real-time statistics
  const job = {
    jobId: jobId, // Add the jobId from URL params
    jobtitle: capitalizeFirstLetter(jobData?.jobtitle),
    company: jobData?.company,
    location: `${capitalizeFirstLetter(jobData?.type)} - ${capitalizeFirstLetter(jobData?.location)}`,
    employmentType: capitalizeFirstLetter(jobData?.employmentType),
    experience: `${jobData?.experience}+ years`,
    salary: `₹${jobData?.salary?.min}–₹${jobData?.salary?.max}`,
    posted: formatDate(jobData?.createdAt),
    isNew: true,
    description: jobData?.description,
    responsibilities: jobData?.keyResponsibilities || [],
    requiredSkills: jobData?.skills || [],
    preferredQualifications: jobData?.preferredQualifications || [],
    stats: {
      total: jobData?.totalApplication_number || 0,
      totalLabel: jobData?.totalApplication_number || 0,
      shortlisted: jobData?.shortlisted_number || 0,
      interviewed: jobData?.interviewed_number || 0,
      secondRound: jobData?.["2ndround_interviewed_number"] || 0
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showSavedResumes) {
    return <AdminSavedResumes onBack={() => setShowSavedResumes(false)} jobId={jobId} jobtitle={job.jobtitle} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center py-0 px-0 bg-gray-50">
        <div className="w-full max-w-6xl bg-gray-50">
          {/* Back Button */}
          <div className="bg-gray-50 w-full px-4 md:px-0 pt-6 pb-2">
            <button
              onClick={() => navigate('/admin')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          {/* Improved Header Row */}
          <div className="bg-gray-50 w-full px-4 md:px-0 pt-2 pb-4">
            <div className="flex items-center justify-between w-full mb-4">
              <div>
                <div className="text-xs text-blue-600 font-semibold mb-1">JOB DETAILS</div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.jobtitle}</h1>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    console.log('Candidate List button clicked');
                    setShowSavedResumes(true);
                  }}
                >
                  <Users size={18} className="text-white" />
                  {resumeCount} Candidate List
                  <svg xmlns='http://www.w3.org/2000/svg' className='inline ml-1' width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-full" />
                {job.company}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <MapPin size={16} className="text-gray-500" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <Briefcase size={16} className="text-gray-500" />
                {job.employmentType}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <Calendar size={16} className="text-gray-500" />
                {job.experience}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <IndianRupee size={16} className="text-gray-500" />
                {job.salary}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <CalendarDays size={16} className="text-gray-500" />
                Posted {job.posted}
              </span>
            </div>
          </div>
          {/* Main Content Row */}
          <div className="flex flex-col lg:flex-row gap-8 w-full mt-8">
            {/* Left: Job Description Card */}
            <div className="flex-1 rounded-xl p-6 md:p-10 mb-6 lg:mb-0 bg-gray-50">
              <h2 className="text-xl font-bold mb-4">Job Description:</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{job.description}</p>
              <h3 className="text-lg font-semibold mb-2">Key Responsibilities:</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <h3 className="text-lg font-semibold mb-2">Required Skills & Experience:</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                {job.requiredSkills.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <h3 className="text-lg font-semibold mb-2">Preferred Qualifications (Nice to Have):</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                {job.preferredQualifications.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            {/* Right: Application Statistics */}
            <div className="w-full lg:w-80 flex-shrink-0 rounded-2xl p-6 flex flex-col items-center bg-gray-50" style={{ minWidth: 320 }}>
              <h4 className="text-2xl font-bold mb-4 text-black">Application Statistics</h4>
              {/* Donut Chart and Legend (replicated from dashboard, now with 4 segments) */}
              <div className="flex flex-col items-center w-full">
                <div className="relative w-72 h-72 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Total Application', value: job.stats.total },
                          { name: 'Shortlisted', value: job.stats.shortlisted },
                          { name: 'Interviewed', value: job.stats.interviewed },
                          { name: '2nd Round Interviewed', value: job.stats.secondRound },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={112}
                        outerRadius={130}
                        fill="#8884d8"
                        paddingAngle={4}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {['#1E75FF', '#0F172A', '#64748B', '#003A8D'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} stroke={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center" style={{padding: '32px 0'}}>
                    <div className="text-5xl font-bold leading-none">{job.stats.total}</div>
                    <div className="text-gray-500 text-lg mt-2">Total Applications</div>
                  </div>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-4 w-full">
                  {[
                    { name: 'Total Application', value: job.stats.total, color: '#1E75FF' },
                    { name: 'Shortlisted', value: job.stats.shortlisted, color: '#0F172A' },
                    { name: 'Interviewed', value: job.stats.interviewed, color: '#64748B' },
                    { name: '2nd Round Interviewed', value: job.stats.secondRound, color: '#003A8D' },
                  ].map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="flex-grow text-base text-gray-700">{entry.name}</span>
                      <span className="bg-gray-800 text-white py-1 px-3 rounded-2xl text-sm font-medium">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobDetailPage; 