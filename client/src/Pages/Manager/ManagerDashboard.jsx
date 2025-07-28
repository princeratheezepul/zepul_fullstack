import React, { useState } from "react";
import AddRecruiter from "../../components/manager/AddRecruiter";
import ManagerAccountSettings from '../../components/manager/ManagerAccountSettings';
import toast from 'react-hot-toast';
import Jobs from '../../components/recruiter/dashboard/Jobs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';



const stageLabels = [
  "Applications",
  "Submitted",
  "Screened",
  "Shortlisted",
  "Offered",
  "Hired",
];

const stageColors = [
  "#0A1833", // Applications (dark blue)
  "#0057FF", // Screened (blue)
  "#FF8A00", // Interviewed (orange)
  "#FFD233", // Shortlisted (yellow)
  "#6B7892", // Offered (gray-blue)
  "#f3f4f6",  // Hired (light gray)
];

// This will be replaced with dynamic data fetching



const ArrowSegment = ({ value, color, isFirst, isLast, empty, index }) => {
  let shapeClass = "middle";
  if (isFirst) shapeClass = "first";
  else if (isLast) shapeClass = "last";
  
  // Different margins for different positions
  let marginLeft = 0;
  if (isFirst) {
    marginLeft = 0; // Applications - no margin
  } else if (index === 1) {
    marginLeft = -18; // Screened - keep original position
  } else if (index === 2) {
    marginLeft = -45; // Interviewed - moderate overlap
  } else if (index === 3) {
    marginLeft = -70; // Shortlisted - more overlap
  } else if (index === 4) {
    marginLeft = -90; // Offered - more overlap
  } else {
    marginLeft = -110; // Hired - more overlap
  }
  
  return (
    <div
      className={`pipeline-segment ${shapeClass} ${empty ? 'empty' : ''}`}
      style={{ background: empty ? undefined : color, marginLeft: marginLeft, minWidth: 80, width: '5.5rem' }}
    >
      {value}
    </div>
  );
};

// Job Closed Trend Chart Component
const JobClosedTrendChart = ({ selectedRecruiter }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDataKey, setActiveDataKey] = useState('');

  React.useEffect(() => {
    fetchJobClosedData();
  }, [selectedRecruiter]);

  const fetchJobClosedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If no recruiter is selected, show empty state
      if (!selectedRecruiter) {
        setData([]);
        setLoading(false);
        return;
      }

      // Use the manager-specific API endpoint for monthly stats
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/stats/monthly`,
        {
          method: 'GET',
          credentials: 'include', // Send cookies instead of Authorization header
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        // Set the first month as active by default
        if (result.data.length > 0) {
          setActiveDataKey(result.data[0].name);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching job closed data:', err);
      setError(err.message);
      // Fallback to empty data (same as Candidate Submission)
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomizedAxisTick = ({ x, y, payload, activeDataKey }) => {
    if (payload.value === activeDataKey) {
      return (
        <g transform={`translate(${x},${y})`}>
          <foreignObject x={-25} y={5} width={50} height={25}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="bg-black text-white text-center rounded-full leading-6"
            >
              {payload.value}
            </div>
          </foreignObject>
        </g>
      );
    }
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={15} dy={0} textAnchor="middle" fill="#6B7280" fontSize={14}>
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomDot = (props) => {
    const { cx, cy, payload, activeDataKey, data } = props;
    if (payload.name === activeDataKey) {
      // Calculate if this is the last data point to adjust positioning
      const isLastPoint = data && data.length > 0 && payload.name === data[data.length - 1]?.name;
      
      // Adjust x position for last point to prevent cutoff
      let tooltipX = cx + 10;
      if (isLastPoint) {
        tooltipX = cx - 130; // Move tooltip to the left for last point
      }
      
      return (
        <foreignObject x={tooltipX} y={cy - 70} width="120" height="65">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-center"
          >
            <p className="text-blue-600 text-2xl font-bold">{payload.uv}</p>
          </div>
        </foreignObject>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading data</p>
          <button 
            onClick={fetchJobClosedData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedRecruiter) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center text-gray-500">
          <p>Select a recruiter to view job closed trend</p>
        </div>
      </div>
    );
  }

  // Calculate max value for Y-axis domain
  const maxValue = Math.max(...data.map(item => item.uv), 10); // Minimum of 10 for better visualization

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 20,
          left: -20,
          bottom: 20,
        }}
        onMouseMove={(e) => {
          if (e.activeLabel) {
            setActiveDataKey(e.activeLabel);
          }
        }}
        onMouseLeave={() => {
          if (data.length > 0) {
            setActiveDataKey(data[0].name);
          }
        }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={<CustomizedAxisTick activeDataKey={activeDataKey} />}
          interval={0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, maxValue]}
          tick={{ fill: '#6B7280', fontSize: 14 }}
        />
        <Area
          type="monotone"
          dataKey="uv"
          stroke="#3B82F6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#chartGradient)"
          dot={(props) => <CustomDot {...props} activeDataKey={activeDataKey} data={data} />}
          activeDot={false}
        />
        {activeDataKey && <ReferenceLine x={activeDataKey} stroke="black" strokeWidth={2.5} />}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Recruiter Detail Full Page
function RecruiterDetailPage({ recruiterId, onClose, token }) {
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const managerName = recruiter?.manager || userInfo?.data?.user?.fullname || '';

  React.useEffect(() => {
    if (!recruiterId) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${recruiterId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRecruiter(data.recruiter);
        setForm({ ...data.recruiter });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch recruiter details');
        setLoading(false);
      });
  }, [recruiterId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${recruiterId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update recruiter');
      }
      const data = await response.json();
      setRecruiter(data.recruiter);
      toast.success('All changes saved');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!recruiterId) return null;
  return (
    <div className="fixed inset-0 z-50 bg-white w-full h-full overflow-y-auto flex flex-col">
      {/* Top bar with close, Add Job, View Performance */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2 border-b border-gray-100">
        <div className="flex-1">
          <button
            className="text-blue-700 text-xs font-semibold focus:outline-none cursor-pointer"
            onClick={onClose}
          >
            &larr; Back
          </button>
        </div>
        <div className="flex gap-3">
          <button
            className="border border-gray-300 rounded-full px-6 py-2 text-black hover:bg-gray-100 bg-white cursor-pointer text-sm font-medium"
            style={{ minWidth: 100 }}
            disabled={saving}
          >
            Add Job
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-medium shadow-none cursor-pointer text-sm"
            style={{ minWidth: 140 }}
            disabled={saving}
          >
            View Performance
          </button>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto flex-1 px-4 md:px-8 py-8">
        <h2 className="text-blue-700 text-xs font-semibold mb-2">EDIT RECRUITER INFORMATION</h2>
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Basic Information</h1>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : (
          <form className="space-y-10">
            {/* Basic Info */}
            <div className="space-y-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Full Name :</label>
                <input
                  name="fullname"
                  value={form.fullname || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Email Id :</label>
                <input
                  name="email"
                  value={form.email || ''}
                  disabled
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-base cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Phone Number :</label>
                <input
                  name="phone"
                  value={form.phone || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                />
              </div>
            </div>
            {/* Role & Job Details */}
            <h2 className="text-xl font-semibold mt-4 mb-2">Role & Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Location :</label>
                <input
                  name="location"
                  value={form.location || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="On-site / Remote / Hybrid"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Assigned Company :</label>
                <input
                  name="assignedCompany"
                  value={form.assignedCompany || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Specialization / Hiring Areas :</label>
                <input
                  name="specialization"
                  value={form.specialization || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="Tech, Design, ..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">TAT Expectations :</label>
                <input
                  name="tatExpectations"
                  value={form.tatExpectations || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="3-5 days"
                />
              </div>
            </div>
            {/* Confirm & Create */}
            <h2 className="text-xl font-semibold mt-4 mb-2">Confirm & Create</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Role</label>
                <input
                  name="role"
                  value={form.role || ''}
                  disabled
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-base cursor-not-allowed"
                  placeholder="Recruiter"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Manager</label>
                <input
                  name="manager"
                  value={managerName}
                  disabled
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-base cursor-not-allowed"
                  placeholder="Manager Name"
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-12 justify-end">
              <button
                type="button"
                className="border border-gray-300 rounded-lg px-6 py-2 text-gray-700 hover:text-gray-900 bg-white cursor-pointer"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-2 font-semibold shadow-none cursor-pointer"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Recruiter Performance Component
function RecruiterPerformance({ recruiter, onClose }) {
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRedFlags();
  }, [recruiter]);

  const fetchRedFlags = async () => {
    try {
      setLoading(true);
      
      if (!recruiter?._id) {
        setRedFlags([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/recruiter/${recruiter._id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const resumes = result.data || [];
          const redFlagsData = calculateRedFlags(resumes);
          setRedFlags(redFlagsData);
        } else {
          setRedFlags([]);
        }
      } else {
        setRedFlags([]);
      }
    } catch (err) {
      console.error('Error fetching red flags:', err);
      setRedFlags([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRedFlags = (resumes) => {
    const flags = [];
    
    // Group resumes by jobId
    const resumesByJob = {};
    resumes.forEach(resume => {
      if (resume.jobId) {
        if (!resumesByJob[resume.jobId]) {
          resumesByJob[resume.jobId] = [];
        }
        resumesByJob[resume.jobId].push(resume);
      }
    });

    // Check each job for high rejection rate
    Object.entries(resumesByJob).forEach(([jobId, jobResumes]) => {
      const totalResumes = jobResumes.length;
      const rejectedResumes = jobResumes.filter(resume => resume.status === 'rejected').length;
      const rejectionRate = (rejectedResumes / totalResumes) * 100;

      if (rejectionRate > 30) {
        // Get job title from the first resume (assuming all resumes for same job have same title)
        const jobTitle = jobResumes[0]?.applicationDetails?.position || 'Unknown Position';
        flags.push({
          type: 'High Rejection Rate',
          jobTitle: jobTitle,
          rejectionCount: rejectedResumes,
          totalCount: totalResumes,
          rejectionRate: rejectionRate.toFixed(1)
        });
      }
    });

    return flags;
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            className="text-blue-700 text-xs font-semibold focus:outline-none cursor-pointer mb-2"
            onClick={onClose}
          >
            &larr; Back to My Recruiters
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Performance</h1>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Job Closed */}
        <div className="bg-white rounded-2xl shadow p-10">
          <div className="flex justify-between items-start mb-8">
            <h2 className="font-bold text-gray-900 text-xl">Job Closed</h2>
            <div className="bg-black text-white text-base px-5 py-3 rounded">
              Target: 42/50
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="18"
                />
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="18"
                  strokeDasharray="690"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-gray-800">84%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average TAT */}
        <div className="bg-white rounded-2xl shadow p-10">
          <h2 className="font-bold text-gray-900 text-xl mb-8">Average TAT</h2>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="400" height="200" viewBox="0 0 400 200">
                <circle
                  cx="200"
                  cy="200"
                  r="140"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="20"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="140"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                  strokeDasharray="440"
                  strokeDashoffset="220"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(40px)' }}>
                <span className="text-5xl font-bold text-gray-800">20/30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Submission Trend */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <h2 className="font-bold text-gray-900 text-xl mb-6">Candidate Submission Trend</h2>
        <JobClosedTrendChart selectedRecruiter={recruiter} />
      </div>

      {/* Red Flags */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Red Flags</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : redFlags.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-lg font-medium">No Red Flags</div>
            <div className="text-gray-500 text-sm mt-1">All rejection rates are within acceptable limits</div>
          </div>
        ) : (
          <div className="space-y-3">
            {redFlags.map((flag, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                <div className="text-red-500 mr-3 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-red-800">{flag.type}</div>
                  <div className="text-sm text-red-600">
                    {flag.jobTitle} ({flag.rejectionCount} rejection{flag.rejectionCount !== 1 ? 's' : ''} - {flag.rejectionRate}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  // State for scorecard review data
  const [scorecardData, setScorecardData] = useState({
    totalResumes: 0,
    reviewedResumes: 0,
    pendingResumes: 0,
    reviewedPercent: 0,
    pendingPercent: 0
  });
  const [scorecardLoading, setScorecardLoading] = useState(true);
  const [scorecardError, setScorecardError] = useState(null);

  // State for candidate pipeline data
  const [candidatePipelineData, setCandidatePipelineData] = useState([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [pipelineError, setPipelineError] = useState(null);

  // State for selected recruiter
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  // State for recruiter performance summary data
  const [recruiterPerformanceData, setRecruiterPerformanceData] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState(null);

  // Fetch scorecard data
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    
    if (!managerId || !token) {
      setScorecardLoading(false);
      return;
    }

    const fetchScorecardData = async () => {
      try {
        setScorecardLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/manager/${managerId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch scorecard data');
        }
        
        const data = await response.json();
        if (data.success) {
          setScorecardData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch scorecard data');
        }
      } catch (err) {
        console.error('Error fetching scorecard data:', err);
        setScorecardError(err.message);
      } finally {
        setScorecardLoading(false);
      }
    };

    fetchScorecardData();
  }, []);

  // Fetch candidate pipeline data
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    
    if (!managerId || !token) {
      setPipelineLoading(false);
      return;
    }

    const fetchPipelineData = async () => {
      try {
        setPipelineLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/manager/${managerId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch pipeline data');
        }
        
        const data = await response.json();
        if (data.success) {
          // Process the resumes data to create pipeline
          const processedData = processPipelineData(data.resumes || []);
          setCandidatePipelineData(processedData);
        } else {
          throw new Error(data.message || 'Failed to fetch pipeline data');
        }
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
        setPipelineError(err.message);
      } finally {
        setPipelineLoading(false);
      }
    };

    fetchPipelineData();
  }, []);

  // Fetch recruiter performance summary data
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    
    if (!managerId || !token) {
      setPerformanceLoading(false);
      return;
    }

    const fetchRecruiterPerformanceData = async () => {
      try {
        setPerformanceLoading(true);
        setPerformanceError(null);
        
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch recruiter performance data');
        }
        
        const data = await response.json();
        if (data.recruiters && Array.isArray(data.recruiters)) {
          // Sort by creation date (most recent first) and take only the first 10
          const sortedRecruiters = data.recruiters
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(recruiter => ({
              name: recruiter.fullname || 'Unknown',
              hires: recruiter.totalHires || 0,
              offers: recruiter.offersMade || 0,
              accepted: recruiter.offersAccepted || 0,
              tat: recruiter.avgTAT || 0
            }));
          
          setRecruiterPerformanceData(sortedRecruiters);
        } else {
          setRecruiterPerformanceData([]);
        }
      } catch (err) {
        console.error('Error fetching recruiter performance data:', err);
        setPerformanceError(err.message);
        setRecruiterPerformanceData([]);
      } finally {
        setPerformanceLoading(false);
      }
    };

    fetchRecruiterPerformanceData();
  }, []);

  // Function to process resume data into pipeline format
  const processPipelineData = (resumes) => {
    const tags = ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'Other'];
    // New order: Applications, Submitted, Screened, Shortlisted, Offered, Hired
    const statuses = ['submitted', 'submitted', 'screening', 'shortlisted', 'offered', 'hired'];
    
    return tags.map(tag => {
      const tagResumes = resumes.filter(resume => resume.tag === tag);
      const stages = statuses.map((status, index) => {
        let count = 0;
        
        if (index === 0) {
          // Applications: count all resumes for this tag
          count = tagResumes.length;
        } else if (index === 1) {
          // Submitted: count resumes with 'submitted' status
          count = tagResumes.filter(resume => resume.status === 'submitted').length;
        } else {
          // Other stages: count by specific status
          count = tagResumes.filter(resume => resume.status === status).length;
        }
        
        return count > 0 ? count : null;
      });
      
      return {
        role: tag,
        stages: stages
      };
    });
  };

  // Use dynamic data for the scorecard review component
  const reviewedPercent = scorecardData.reviewedPercent;
  const pendingPercent = scorecardData.pendingPercent;

  // SVG circle parameters
  const size = 192; // px (w-48 h-48)
  const stroke = 14;
  const radius = 86 - stroke / 2; // 86 is half of 172 (inner circle), minus half stroke
  const circumference = 2 * Math.PI * radius;
  const reviewedLength = (circumference * reviewedPercent) / 100;
  const pendingLength = (circumference * pendingPercent) / 100;
  const gapLength = circumference * 0.08; // 8% gap at the bottom
  const offsetReviewed = gapLength / 2;
  const offsetPending = reviewedLength + gapLength / 2;

  const [selectedSidebar, setSelectedSidebar] = useState(0);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRecruiterId, setDetailRecruiterId] = useState(null);
  const [recruiters, setRecruiters] = useState([]);
  const [recruitersLoading, setRecruitersLoading] = useState(true);
  const [recruitersError, setRecruitersError] = useState(null);

  // Fetch recruiters once for the whole dashboard
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    if (!managerId || !token) return;
    setRecruitersLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRecruiters((data.recruiters || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setRecruitersError(null);
      })
      .catch(err => setRecruitersError('Failed to fetch recruiters'))
      .finally(() => setRecruitersLoading(false));
  }, []);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.data?.accessToken;

  // Sidebar icons (SVGs)
  const icons = [
    // Dashboard (selected)
   <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.55556 15.5556H10.8889C11.7444 15.5556 12.4444 14.8556 12.4444 14V1.55556C12.4444 0.7 11.7444 0 10.8889 0H1.55556C0.7 0 0 0.7 0 1.55556V14C0 14.8556 0.7 15.5556 1.55556 15.5556ZM1.55556 28H10.8889C11.7444 28 12.4444 27.3 12.4444 26.4444V20.2222C12.4444 19.3667 11.7444 18.6667 10.8889 18.6667H1.55556C0.7 18.6667 0 19.3667 0 20.2222V26.4444C0 27.3 0.7 28 1.55556 28ZM17.1111 28H26.4444C27.3 28 28 27.3 28 26.4444V14C28 13.1444 27.3 12.4444 26.4444 12.4444H17.1111C16.2556 12.4444 15.5556 13.1444 15.5556 14V26.4444C15.5556 27.3 16.2556 28 17.1111 28ZM15.5556 1.55556V7.77778C15.5556 8.63333 16.2556 9.33333 17.1111 9.33333H26.4444C27.3 9.33333 28 8.63333 28 7.77778V1.55556C28 0.7 27.3 0 26.4444 0H17.1111C16.2556 0 15.5556 0.7 15.5556 1.55556Z" fill="white" fill-opacity="0.7"/>
</svg>
,
    // Team
    <svg key="team" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" /><path d="M2 20c0-4 8-4 8 0" stroke="currentColor" /><path d="M14 20c0-4 8-4 8 0" stroke="currentColor" /></svg>,
    // List
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.4997 19.8327H22.1663M10.4997 13.9993H22.1663M10.4997 8.16602H22.1663M5.83529 19.8327V19.835L5.83301 19.835V19.8327H5.83529ZM5.83529 13.9993V14.0017L5.83301 14.0016V13.9993H5.83529ZM5.83529 8.16602V8.16835L5.83301 8.16829V8.16602H5.83529Z" stroke="white" stroke-opacity="0.7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
,

  ];



  function getStatusColor(status) {
    if (status === "Active") return "text-green-600 font-semibold";
    if (status === "Inactive") return "text-red-600 font-semibold";
    return "text-gray-500";
  }

  // MyRecruiters now receives recruiters as a prop
  function MyRecruiters({ selectedRecruiter, setSelectedRecruiter }) {
    const [showAddRecruiter, setShowAddRecruiter] = useState(false);
    const [showPerformance, setShowPerformance] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [recruiterToDelete, setRecruiterToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const itemsPerPage = 10;

    // Get available years from recruiter data
    const getAvailableYears = () => {
      const years = new Set();
      recruiters.forEach(recruiter => {
        if (recruiter.createdAt) {
          years.add(new Date(recruiter.createdAt).getFullYear().toString());
        }
      });
      return Array.from(years).sort((a, b) => b - a); // Sort in descending order
    };

    const availableYears = getAvailableYears();

    // Set default selected year to the most recent year if available
    React.useEffect(() => {
      if (availableYears.length > 0 && !selectedYear) {
        setSelectedYear(availableYears[0]); // First year is the most recent (descending order)
      }
    }, [availableYears, selectedYear]);

    // Use recruiters, recruitersLoading, recruitersError from parent
    const filteredRecruiters = recruiters.filter(rec => {
      // Search filter
      const matchesSearch = rec.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Year filter
      let matchesYear = true;
      if (selectedYear && selectedYear !== "") {
        const recruiterYear = new Date(rec.createdAt).getFullYear().toString();
        matchesYear = recruiterYear === selectedYear;
      }
      
      return matchesSearch && matchesYear;
    });

    // Pagination
    const totalPages = Math.ceil(filteredRecruiters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecruiters = filteredRecruiters.slice(startIndex, endIndex);

    // Reset to first page when search or year changes
    React.useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, selectedYear]);

    // Handle delete recruiter
    const handleDeleteClick = (recruiter) => {
      setRecruiterToDelete(recruiter);
      setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
      if (!recruiterToDelete) return;
      
      setDeleting(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${recruiterToDelete._id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          // Remove from local state
          setRecruiters(prev => prev.filter(rec => rec._id !== recruiterToDelete._id));
          setShowDeleteDialog(false);
          setRecruiterToDelete(null);
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete recruiter');
        }
      } catch (err) {
        console.error('Error deleting recruiter:', err);
        alert('Failed to delete recruiter. Please try again.');
      } finally {
        setDeleting(false);
      }
    };

    const handleDeleteCancel = () => {
      setShowDeleteDialog(false);
      setRecruiterToDelete(null);
    };

    const handleRowClick = (recruiter) => {
      setSelectedRecruiter(recruiter);
      setShowPerformance(true);
    };

    if (showAddRecruiter) {
      return <AddRecruiter onClose={() => setShowAddRecruiter(false)} />;
    }

    if (showPerformance && selectedRecruiter) {
      return (
        <RecruiterPerformance 
          recruiter={selectedRecruiter} 
          onClose={() => {
            setShowPerformance(false);
            setSelectedRecruiter(null);
          }} 
        />
      );
    }

    if (recruitersLoading) {
      return (
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading recruiters...</div>
          </div>
        </div>
      );
    }

    if (recruitersError) {
      return (
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {recruitersError}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <div className="text-xs text-blue-600 font-semibold tracking-wide mb-1">JOB DETAILS</div>
            <h1 className="text-2xl font-bold text-gray-900">My Recruiters</h1>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
           
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-lg font-medium shadow-none cursor-pointer transition-colors" 
              onClick={() => setShowAddRecruiter(true)}
            >
              + Add Recruiter
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="flex items-center bg-gray-200 rounded-lg px-4 py-2 w-full max-w-2xl">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="bg-transparent outline-none w-full text-gray-700 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded-2xl border border-gray-200">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 px-4 font-medium text-left">Name</th>
                <th className="py-3 px-4 font-medium text-left">Email ID</th>
                <th className="py-3 px-4 font-medium text-left">Location</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-4 font-medium text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecruiters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    {recruiters.length === 0 ? "No recruiters found. Create your first recruiter!" : "No recruiters match your search."}
                  </td>
                </tr>
              ) : (
                currentRecruiters.map((rec, idx) => (
                  <tr 
                    key={rec._id || idx} 
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(rec)}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">{rec.fullname || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-700">{rec.email}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{rec.location || "N/A"}</td>
                    <td className={`py-3 px-4 text-center ${getStatusColor(rec.status || "Inactive")}`}>
                      {rec.status || "Inactive"}
                    </td>
                    <td className="py-3 px-4 flex gap-3 items-center" onClick={(e) => e.stopPropagation()}>
                      {/* Action icons: view and delete only */}
                      <button 
                        className="text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                        title="View Details"
                        onClick={e => {
                          e.stopPropagation();
                          setDetailRecruiterId(rec._id);
                          setShowDetailModal(true);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M8 7h8M8 11h8M8 15h4" />
                        </svg>
                      </button>
                      <button 
                        className="text-gray-900 hover:text-red-500 cursor-pointer transition-colors"
                        title="Delete Recruiter"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(rec);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          <path d="M19 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Recruiter</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{recruiterToDelete?.fullname}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex flex-col justify-between items-center bg-black w-20 py-6 fixed md:sticky top-0 left-0 h-screen z-20">
        <div className="flex flex-col items-center w-full gap-6">
          {/* Logo */}
          <div className="mb-8">
            <img src="/zepul_sidebar_logo.png" alt="Logo" className="h-6 w-6" />
          </div>
          <hr className="w-10 border-gray-700 mb-8" />
          {/* Icons */}
          <nav className="flex flex-col items-center justify-center gap-8 w-full">
            {icons.map((icon, idx) => (
              <button key={idx} onClick={() => { setSelectedSidebar(idx); setShowAccountInfo(false); }} className={`cursor-pointer ${idx === selectedSidebar ? "bg-blue-600 rounded-lg p-2" : "p-2"}`}>
                <span className={idx === selectedSidebar ? "text-white" : "text-gray-300"}>{icon}</span>
              </button>
            ))}
          </nav>
        </div>
        {/* Avatar */}
        <div className="mb-2">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User Avatar"
            className="w-12 h-12 rounded-full border-2 border-blue-600 object-cover cursor-pointer"
            onClick={() => setShowAccountInfo(true)}
          />
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ml-20">
        {showAccountInfo ? (
          <div className="bg-[#F7F8FA] min-h-screen flex items-start">
            <div className="w-full max-w-[90vw]">
              <ManagerAccountSettings />
            </div>
          </div>
        ) : selectedSidebar === 1 ? (
          <MyRecruiters selectedRecruiter={selectedRecruiter} setSelectedRecruiter={setSelectedRecruiter} />
        ) : selectedSidebar === 2 ? (
          <div className="bg-[#F7F8FA] min-h-screen p-2 md:p-6">
            <Jobs />
          </div>
        ) : (
          <div className="bg-[#F7F8FA] min-h-screen p-2 md:p-6">
            {/* Header */}
            <div className="bg-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-600 font-semibold tracking-wide mb-1">DASHBOARD</div>
                  <h1 className="text-2xl font-bold text-gray-900">Manager Overview</h1>
                </div>
              </div>
              <hr className="my-4 border-gray-200" />
              <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 mb-6 border border-gray-100">
                <span className="text-gray-900 font-medium">Task Requiring Manager Attention</span>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm shadow-none cursor-pointer"
                  onClick={() => setSelectedSidebar(2)}
                >
                  Job Creation
                </button>
              </div>
            </div>
           
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              {/* Candidate Pipeline */}
              <div className="bg-white rounded-2xl shadow p-4 md:p-8 mb-6 overflow-x-auto">
                <h2 className="font-semibold text-gray-900 mb-6 text-xs md:text-sm">Candidate Pipeline</h2>
                {pipelineLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading pipeline data...</div>
                  </div>
                ) : pipelineError ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-red-500 text-center">
                      <div className="text-sm">Error loading pipeline data</div>
                      <div className="text-xs mt-1">{pipelineError}</div>
                    </div>
                  </div>
                ) : (
                <div className="min-w-[700px]">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr>
                        <th className="w-48 text-left text-xs text-gray-500 font-medium pb-4"></th>
                        {stageLabels.map((label, idx) => (
                          <th key={label} className={`text-xs text-gray-500 font-medium pb-4 ${label === 'Submitted' || label === 'Screened' || label === 'Shortlisted' || label === 'Offered' || label === 'Hired' ? 'text-left' : 'text-center'}`} style={label === 'Submitted' ? { transform: 'translateX(0px)' } : label === 'Screened' ? { transform: 'translateX(-30px)' } : label === 'Shortlisted' ? { transform: 'translateX(-65px)' } : label === 'Offered' ? { transform: 'translateX(-80px)' } : label === 'Hired' ? { transform: 'translateX(-95px)' } : {}}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                        {candidatePipelineData.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="py-8 text-center text-gray-500">
                              No pipeline data available
                            </td>
                          </tr>
                        ) : (
                          candidatePipelineData.map((item, idx) => (
                        <tr key={item.role} className="align-middle">
                          <td className="text-xs text-gray-700 font-medium py-2 pr-4">{item.role}</td>
                          {item.stages.map((val, i) => (
                            <td key={i} className="py-2 px-1">
                              <ArrowSegment
                                value={val !== null ? val : ""}
                                color={stageColors[i]}
                                isFirst={i === 0}
                                isLast={i === item.stages.length - 1}
                                empty={val === null}
                                index={i}
                              />
                            </td>
                          ))}
                        </tr>
                          ))
                        )}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
              {/* Pending Scorecard Review */}
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center w-full max-w-sm mx-auto">
                <h2 className="font-semibold text-gray-900 mb-6 text-lg text-left w-full">Pending Scorecard Review</h2>
                {scorecardLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : scorecardError ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-red-500 text-center">
                      <div className="text-sm">Error loading data</div>
                      <div className="text-xs mt-1">{scorecardError}</div>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="relative flex items-center justify-center mb-8">
                  <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="block"
                  >
                    {/* Background Circle */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth={stroke}
                    />
                    {/* Pending Arc (black) */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#0A1833"
                      strokeWidth={stroke}
                      strokeDasharray={`${pendingLength} ${circumference - pendingLength}`}
                      strokeDashoffset={-offsetPending}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                    {/* Reviewed Arc (blue) */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth={stroke}
                      strokeDasharray={`${reviewedLength} ${circumference - reviewedLength}`}
                      strokeDashoffset={-offsetReviewed}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  </svg>
                      <span className="absolute text-3xl font-bold text-gray-800">{pendingPercent}%</span>
                </div>
                <div className="w-full flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div>
                          <span className="text-gray-700 font-medium">Pending ({scorecardData.pendingResumes})</span>
                      <div className="w-full h-3 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full bg-[#0A1833] rounded-full"
                          style={{ width: `${pendingPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                          <span className="text-gray-700 font-medium">Reviewed ({scorecardData.reviewedResumes})</span>
                      <div className="w-full h-3 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full bg-[#2563EB] rounded-full"
                          style={{ width: `${reviewedPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                      <div className="text-center text-sm text-gray-500 mt-2">
                        Total: {scorecardData.totalResumes}
                </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Recruiter Performance Summary */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
                <h2 className="font-bold text-gray-900 text-xl">Recruiter Performance Summary</h2>
              </div>
              <div className="overflow-x-auto">
                {performanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : performanceError ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-red-500 mb-2">Error loading performance data</p>
                      <p className="text-sm text-gray-500">{performanceError}</p>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="py-3 px-2 font-medium">Recruiter</th>
                        <th className="py-3 px-2 font-medium">Total Hires</th>
                        <th className="py-3 px-2 font-medium">Offers Made</th>
                        <th className="py-3 px-2 font-medium">Offers Accepted</th>
                        <th className="py-3 px-2 font-medium">Avg TAT (Days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recruiterPerformanceData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-gray-500">
                            No recruiter performance data available
                          </td>
                        </tr>
                      ) : (
                        recruiterPerformanceData.map((rec, idx) => (
                          <tr key={idx} className="border-b last:border-b-0">
                            <td className="py-3 px-2 text-gray-900">{rec.name}</td>
                            <td className="py-3 px-2">{rec.hires}</td>
                            <td className="py-3 px-2">{rec.offers}</td>
                            <td className="py-3 px-2">{rec.accepted}</td>
                            <td className="py-3 px-2">{rec.tat}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      {showDetailModal && (
        <RecruiterDetailPage
          recruiterId={detailRecruiterId}
          onClose={() => { setShowDetailModal(false); setDetailRecruiterId(null); }}
          token={token}
        />
      )}
    </div>
  );
} 