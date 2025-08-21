import React, { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';

import AccountManagerJobs from '../../Components/accountmanager/dashboard/AccountManagerJobs.jsx';
import CompanyList from './Navigation/CompanyList.jsx';
import AccountManagerInfo from '../../Components/AccountManagerInfo.jsx';
import PasswordSecurity from '../../Components/manager/PasswordSecurity.jsx';
import EmailNotification from '../../Components/manager/EmailNotification.jsx';
import { useAuth } from '../../context/AuthContext';

// Remove static jobsData
// const jobsData = [
//   { company: 'Inno Tech', current: 92, total: 100, color: 'bg-blue-500' },
//   { company: 'QuantumSoft', current: 48, total: 100, color: 'bg-orange-400' },
//   { company: 'CloudNine', current: 10, total: 15, color: 'bg-green-400' },
// ];



const statusColors = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Scheduled: 'bg-purple-100 text-purple-700',
  shortlisted: 'bg-green-100 text-green-700',
};

const AccountManager = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'jobs', 'company', or 'profile'
  const [settingsTab, setSettingsTab] = useState('account'); // 'account', 'password', etc.
  const [resumeStats, setResumeStats] = useState({
    total: 0,
    data: [
      { name: 'Recommended', value: 0, color: '#1557FF' },
      { name: 'shorted', value: 0, color: '#030B1C' },
      { name: 'Sales', value: 0, color: '#FF7A00' },
      { name: 'Interview', value: 0, color: '#5A6A7A' },
      { name: 'Finance', value: 0, color: '#FFC700' },
      { name: 'Hired', value: 0, color: '#4EFFB6' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [shortlistedResumes, setShortlistedResumes] = useState([]);
  const [companyJobsData, setCompanyJobsData] = useState([]); // New state for company jobs
  const [interviewStatusData, setInterviewStatusData] = useState([]); // New state for interview status

  // Fetch resume statistics, shortlisted resumes, and jobs for company stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.data?.accessToken;

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // Fetch resume statistics
        const statsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch resume statistics');
        }

        const statsData = await statsResponse.json();
        setResumeStats(statsData);

        // Fetch shortlisted resumes
        const shortlistedResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/shortlisted`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!shortlistedResponse.ok) {
          throw new Error('Failed to fetch shortlisted resumes');
        }

        const shortlistedData = await shortlistedResponse.json();
        setShortlistedResumes(shortlistedData);

        // Fetch all jobs for company stats
        const jobsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/getjob`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!jobsResponse.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const jobsData = await jobsResponse.json();
        // jobsData.jobs is the array
        const jobs = jobsData.jobs || [];
        // Group jobs by company
        const companyMap = {};
        const now = new Date();
        jobs.forEach(job => {
          const company = job.company || 'Unknown';
          if (!companyMap[company]) {
            companyMap[company] = { total: 0, active: 0 };
          }
          companyMap[company].total += 1;
          // Check if job is closed or deadline passed
          const isClosed = job.isClosed === true;
          let deadlinePassed = false;
          if (job.hiringDeadline) {
            const deadline = new Date(job.hiringDeadline);
            deadlinePassed = now > deadline;
          }
          if (!isClosed && !deadlinePassed) {
            companyMap[company].active += 1;
          }
        });
        // Convert to array and sort by total jobs desc
        let companyArr = Object.entries(companyMap).map(([company, counts]) => ({
          company,
          current: counts.active,
          total: counts.total
        }));
        // Sort by total jobs desc, then by active jobs desc
        companyArr.sort((a, b) => b.total - a.total || b.current - a.current);
        // Take top 5
        companyArr = companyArr.slice(0, 5);
        // Assign colors (cycle through a palette)
        const colorPalette = ['bg-blue-500', 'bg-orange-400', 'bg-green-400', 'bg-purple-500', 'bg-pink-500'];
        companyArr = companyArr.map((item, idx) => ({ ...item, color: colorPalette[idx % colorPalette.length] }));
        setCompanyJobsData(companyArr);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeView === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeView]);

  // Fetch interview status resumes and recruiter names
  useEffect(() => {
    const fetchInterviewStatusData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.data?.accessToken;
        if (!token) return;
        // Fetch resumes with status 'shortlisted' or 'rejected'
        const resumesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!resumesResponse.ok) throw new Error('Failed to fetch resumes');
        const resumes = await resumesResponse.json();
        console.log('Raw resumes from backend:', resumes);
        // Filter for shortlisted or rejected
        const filtered = resumes.filter(r => r.status === 'shortlisted' || r.status === 'rejected');
        console.log('Filtered resumes:', filtered);
        // Fetch all recruiters at once
        const recruitersResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/recruiters`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        let recruiterMap = {};
        if (recruitersResponse.ok) {
          const recruitersData = await recruitersResponse.json();
          if (Array.isArray(recruitersData.recruiters)) {
            recruiterMap = recruitersData.recruiters.reduce((acc, recruiter) => {
              acc[recruiter._id] = recruiter.fullname || recruiter.username || 'Unknown';
              return acc;
            }, {});
          }
        }
        // Add recruiter_fullname to each resume
        const filteredWithRecruiter = filtered.map(resume => ({
          ...resume,
          recruiter_fullname: recruiterMap[resume.recruiterId] || 'Unknown',
        }));
        setInterviewStatusData(filteredWithRecruiter);
      } catch (err) {
        setInterviewStatusData([]);
      }
    };
    if (activeView === 'dashboard') {
      fetchInterviewStatusData();
    }
  }, [activeView]);

  // Function to download scorecard
  const handleDownloadScorecard = async (resumeId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Fetch full resume details for scorecard
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/scorecard/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume details');
      }

      const resumeData = await response.json();
      console.log('Resume data for scorecard:', resumeData);

      // Generate and download PDF
      generateScorecardPDF(resumeData);
    } catch (error) {
      console.error('Error downloading scorecard:', error);
      alert('Failed to download scorecard');
    }
  };

  // Function to generate scorecard PDF
  const generateScorecardPDF = (resumeData) => {
    try {
      // Helper to determine match label
      const getMatchLabel = (score) => {
        if (score >= 80) return 'Strong Match';
        if (score >= 60) return 'Good Match';
        return 'Less Match';
      };

      const score = resumeData.overallScore || resumeData.ats_score || 0;
      const match = getMatchLabel(score);

      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <title>${resumeData.name || 'Candidate'} Scorecard</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 20px; 
              }
              .header h1 { 
                font-size: 28px; 
                margin-bottom: 10px; 
                color: #000;
              }
              .header p { 
                font-size: 14px; 
                color: #666; 
              }
              .section { 
                margin-bottom: 25px; 
              }
              .section h2 { 
                font-size: 20px; 
                margin-bottom: 10px; 
                color: #000;
                border-bottom: 1px solid #ccc; 
                padding-bottom: 5px; 
              }
              .section h3 { 
                font-size: 16px; 
                margin-bottom: 8px; 
                color: #000;
                border-bottom: 1px solid #eee; 
                padding-bottom: 3px; 
              }
              .grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
              }
              .info-item { 
                margin-bottom: 10px; 
              }
              .info-item strong { 
                color: #000; 
              }
              .skills { 
                display: flex; 
                flex-wrap: wrap; 
                gap: 8px; 
                margin-top: 10px; 
              }
              .skill { 
                background: #f3f4f6; 
                padding: 4px 12px; 
                border-radius: 12px; 
                font-size: 12px; 
                color: #374151; 
              }
              .score { 
                text-align: center; 
                margin: 20px 0; 
              }
              .score h1 { 
                font-size: 48px; 
                color: #2563eb; 
                margin-bottom: 5px; 
              }
              .score p { 
                font-size: 18px; 
                color: #6b7280; 
              }
              .footer { 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid #e5e7eb; 
                text-align: center; 
                font-size: 12px; 
                color: #6b7280; 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>Candidate Scorecard</div>
              <p>Generated by ZEPUL - ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <div>Candidate Information</div>
              <div class="grid">
                <div class="info-item">
                  <strong>Name:</strong> ${resumeData.name || 'N/A'}
                </div>
                <div class="info-item">
                  <strong>Email:</strong> ${resumeData.email || 'N/A'}
                </div>
                <div class="info-item">
                  <strong>Title:</strong> ${resumeData.title || 'N/A'}
                </div>
                <div class="info-item">
                  <strong>Location:</strong> ${resumeData.location || 'N/A'}
                </div>
                <div class="info-item">
                  <strong>Experience:</strong> ${resumeData.experience || 'N/A'}
                </div>
                <div class="info-item">
                  <strong>Phone:</strong> ${resumeData.phone || 'N/A'}
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="score">
                <div>Overall Assessment Score</div>
                <div>${score}%</div>
                <p>${match}</p>
              </div>
            </div>
            
            <div class="section">
              <div>Key Skills</div>
              <div class="skills">
                ${resumeData.skills ? resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('') : 'N/A'}
              </div>
            </div>
            
            ${resumeData.about ? `
            <div class="section">
              <div>About</div>
              <p>${resumeData.about}</p>
            </div>
            ` : ''}
            
            ${resumeData.aiSummary ? `
            <div class="section">
              <div>AI Analysis Summary</div>
              ${Object.entries(resumeData.aiSummary).map(([key, value]) => `
                <div style="margin-bottom: 15px;">
                  <div style="font-size: 14px; margin-bottom: 5px; color: #000;">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <p style="color: #666;">${value}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.aiScorecard ? `
            <div class="section">
              <div>AI Scorecard</div>
              ${Object.entries(resumeData.aiScorecard).map(([key, value]) => `
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="font-size: 14px; color: #000;">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style="font-weight: bold; color: #000;">${value}%</span>
                  </div>
                  <div style="width: 100%; background: #e0e0e0; height: 8px; border-radius: 4px;">
                    <div style="width: ${value}%; background: #2563eb; height: 8px; border-radius: 4px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>This scorecard was generated automatically by ZEPUL</p>
              <p>Status: Shortlisted</p>
            </div>
          </body>
        </html>
      `;

      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.name || 'candidate'}-scorecard.html`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      {/* Sidebar */}
      <aside className="flex flex-col justify-between items-center bg-white w-20 py-6 sticky top-0 left-0 h-screen z-20 shadow-sm">
        <div className="flex flex-col items-center w-full gap-6">
          {/* Logo */}
          <div className="mb-8">
            <img src="/zepul_sidebar_logo.png" alt="Logo" className="h-6 w-6 filter brightness-0" />
          </div>
          <hr className="w-10 border-gray-700 mb-8" />
          {/* Icons */}
          <nav className="flex flex-col items-center justify-center gap-8 w-full">
            {/* Dashboard */}
            <div className="relative">
              <button 
                onClick={() => setActiveView('dashboard')} 
                className={`cursor-pointer ${activeView === 'dashboard' ? "bg-blue-600 rounded-lg p-2" : "p-2"}`}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.55556 15.5556H10.8889C11.7444 15.5556 12.4444 14.8556 12.4444 14V1.55556C12.4444 0.7 11.7444 0 10.8889 0H1.55556C0.7 0 0 0.7 0 1.55556V14C0 14.8556 0.7 15.5556 1.55556 15.5556ZM1.55556 28H10.8889C11.7444 28 12.4444 27.3 12.4444 26.4444V20.2222C12.4444 19.3667 11.7444 18.6667 10.8889 18.6667H1.55556C0.7 18.6667 0 19.3667 0 20.2222V26.4444C0 27.3 0.7 28 1.55556 28ZM17.1111 28H26.4444C27.3 28 28 27.3 28 26.4444V14C28 13.1444 27.3 12.4444 26.4444 12.4444H17.1111C16.2556 12.4444 15.5556 13.1444 15.5556 14V26.4444C15.5556 27.3 16.2556 28 17.1111 28ZM15.5556 1.55556V7.77778C15.5556 8.63333 16.2556 9.33333 17.1111 9.33333H26.4444C27.3 9.33333 28 8.63333 28 7.77778V1.55556C28 0.7 27.3 0 26.4444 0H17.1111C16.2556 0 15.5556 0.7 15.5556 1.55556Z" fill="black" fill-opacity="0.7"/>
                </svg>
              </button>
            </div>
            {/* Jobs */}
            <div className="relative">
              <button 
                onClick={() => setActiveView('jobs')} 
                className={`cursor-pointer ${activeView === 'jobs' ? "bg-blue-600 rounded-lg p-2" : "p-2"}`}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.0017 8.35106C20.9317 8.33939 20.8501 8.33939 20.7801 8.35106C19.1701 8.29273 17.8867 6.97439 17.8867 5.34106C17.8867 3.67272 19.2284 2.33105 20.8967 2.33105C22.565 2.33105 23.9067 3.68439 23.9067 5.34106C23.895 6.97439 22.6117 8.29273 21.0017 8.35106Z" stroke="black" stroke-opacity="0.7" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M19.8006 16.8446C21.399 17.1129 23.1606 16.8329 24.3973 16.0046C26.0423 14.9079 26.0423 13.1112 24.3973 12.0146C23.149 11.1862 21.364 10.9062 19.7656 11.1862" stroke="black" stroke-opacity="0.7" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M6.9636 8.35106C7.0336 8.33939 7.11526 8.33939 7.18526 8.35106C8.79526 8.29273 10.0786 6.97439 10.0786 5.34106C10.0786 3.67272 8.73693 2.33105 7.0686 2.33105C5.40026 2.33105 4.05859 3.68439 4.05859 5.34106C4.07026 6.97439 5.3536 8.29273 6.9636 8.35106Z" stroke="black" stroke-opacity="0.7" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M8.16635 16.8446C6.56802 17.1129 4.80635 16.8329 3.56969 16.0046C1.92469 14.9079 1.92469 13.1112 3.56969 12.0146C4.81802 11.1862 6.60302 10.9062 8.20135 11.1862" stroke="black" stroke-opacity="0.7" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M13.9978 17.0669C13.9278 17.0552 13.8461 17.0552 13.7761 17.0669C12.1661 17.0085 10.8828 15.6902 10.8828 14.0569C10.8828 12.3885 12.2245 11.0469 13.8928 11.0469C15.5611 11.0469 16.9028 12.4002 16.9028 14.0569C16.8911 15.6902 15.6078 17.0202 13.9978 17.0669Z" stroke="black" stroke-opacity="0.7" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M10.6048 20.7429C8.95984 21.8396 8.95984 23.6363 10.6048 24.7329C12.4715 25.9813 15.5282 25.9813 17.3948 24.7329C19.0398 23.6363 19.0398 21.8396 17.3948 20.7429C15.5398 19.5063 12.4715 19.5063 10.6048 20.7429Z" stroke="black" stroke-opacity="0.7" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
            {/* Company List */}
            <div className="relative">
              <button 
                onClick={() => setActiveView('company')} 
                className={`cursor-pointer ${activeView === 'company' ? "bg-blue-600 rounded-lg p-2" : "p-2"}`}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.4997 19.8327H22.1663M10.4997 13.9993H22.1663M10.4997 8.16602H22.1663M5.83529 19.8327V19.835L5.83301 19.835V19.8327H5.83529ZM5.83529 13.9993V14.0017L5.83301 14.0016V13.9993H5.83529ZM5.83529 8.16602V8.16835L5.83301 8.16829V8.16602H5.83529Z" stroke="black" stroke-opacity="0.7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </nav>
        </div>
        {/* Avatar */}
        <div className="mb-2">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User Avatar"
            className="w-12 h-12 rounded-full border-2 border-blue-600 object-cover cursor-pointer"
            onClick={() => setActiveView('profile')}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#F7F8FA] min-h-screen">
        {activeView === 'dashboard' ? (
          <div className="h-screen overflow-y-auto p-2 md:p-4">
            {/* Header */}
            <div className="bg-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-600 font-semibold tracking-wide mb-1">DASHBOARD</div>
                  <div className="text-xl font-bold text-gray-900">Account Manager Overview</div>
                </div>
              </div>
              <hr className="my-2 border-gray-200" />
            </div>

                         {/* Cards Row */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-2">
              {/* Active Jobs by Company */}
              <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4">
                <div className="font-semibold text-gray-900 mb-3 text-xs md:text-sm">Active Jobs by Company</div>
                <div className="space-y-4">
                  {companyJobsData.map((job, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm font-medium">
                        <span>{job.company}</span>
                        <span>{job.current}/{job.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className={`${job.color} h-2 rounded-full`} style={{ width: `${(job.total > 0 ? (job.current / job.total) * 100 : 0)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                             {/* Recruiter Activity Overview */}
               <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4">
                 <div className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Recruiter Activity Overview</div>
                 {loading ? (
                   <div className="flex items-center justify-center w-full h-44">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                   </div>
                                   ) : (
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 h-full min-h-[200px]">
                      {/* Donut Chart */}
                      <div className="relative w-32 h-32 lg:w-36 lg:h-36 flex items-center justify-center">
                        {/* Donut slices - dynamically generated */}
                        <div
                          className="absolute w-full h-full rounded-full"
                          style={{
                            background: resumeStats.total > 0
                              ? `conic-gradient(${resumeStats.data.map((item, index) => {
                                const startPercent = resumeStats.data.slice(0, index).reduce((sum, prevItem) => sum + (prevItem.value / resumeStats.total * 100), 0);
                                const endPercent = startPercent + (item.value / resumeStats.total * 100);
                                return `${item.color} ${startPercent}% ${endPercent}%`;
                              }).join(', ')})`
                              : '#e5e7eb'
                          }}
                        ></div>
                        {/* White center - smaller for thinner ring */}
                        <div className="absolute w-24 h-24 lg:w-28 lg:h-28 bg-white rounded-full flex flex-col items-center justify-center z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                          <span className="text-xl lg:text-2xl font-semibold text-gray-800">{resumeStats.total}</span>
                          <span className="text-gray-400 text-xs mt-1 font-light">Total</span>
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="flex flex-col justify-center space-y-2 w-full max-w-xs">
                        {resumeStats.data.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                              <span className="text-xs font-light text-gray-500 truncate">{item.name}</span>
                            </div>
                            <span className="bg-black text-white rounded-2xl px-2 py-0.5 text-xs font-semibold min-w-[2rem] text-center">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                 )}
               </div>

              {/* Candidate Scorecards */}
              <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4">
                <div className="font-semibold text-gray-900 mb-3 text-xs md:text-sm">Candidate Scorecards</div>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : shortlistedResumes.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No shortlisted candidates found</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                    {shortlistedResumes.map((resume, idx) => (
                      <div key={resume._id || idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-2">
                          <img
                            src={`https://api.dicebear.com/8.x/initials/svg?seed=${resume.name}`}
                            alt="avatar"
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium">{resume.name}</div>
                            <div className="text-xs text-gray-400">{resume.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadScorecard(resume._id)}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Interview Status Table */}
            <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-gray-900 text-base md:text-lg">Interview Status</div>
                <div className="flex space-x-2">
                  <button className="bg-black text-white px-4 py-1 rounded text-sm">All Data</button>
                  {/* Removed the 2022 button */}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Candidate Name</th>
                      <th className="py-2 px-2">Recruiter</th>
                      <th className="py-2 px-2">Interview Round</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Next steps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviewStatusData.map((row, idx) => {
                      const round = Array.isArray(row.recommended_job_roles) && row.recommended_job_roles.length > 0 ? row.recommended_job_roles.length : 1;
                      let next = '';
                      if (row.status === 'shortlisted' && round === 1) {
                        next = 'Schedule 2nd';
                      } else if (row.status === 'rejected' && round === 1) {
                        next = 'Await Feedback';
                      }
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">{row.name}</td>
                          <td className="py-2 px-2">{row.recruiter_fullname}</td>
                          <td className="py-2 px-2">{round}</td>
                          <td className="py-2 px-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}>{row.status}</span>
                          </td>
                          <td className="py-2 px-2">{next}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeView === 'jobs' ? (
          <div className="h-screen overflow-y-auto p-2 md:p-6">
            <AccountManagerJobs />
          </div>
        ) : activeView === 'company' ? (
          <div className="h-screen overflow-y-auto p-2 md:p-6">
            <CompanyList />
          </div>
        ) : activeView === 'profile' ? (
          <div className="h-screen overflow-y-auto">
            <div className="flex w-full min-h-screen">
              <div className="w-1/4 bg-white border-r pt-16 px-8">
              <div className="text-xs text-gray-400 font-semibold mb-6">SETTINGS</div>
              <ul className="space-y-4">
                <li
                  className={`font-medium cursor-pointer ${settingsTab === 'account' ? 'text-blue-600' : 'text-gray-700'}`}
                  onClick={() => setSettingsTab('account')}
                >Account Info</li>
                <li
                  className={`font-medium cursor-pointer ${settingsTab === 'password' ? 'text-blue-600' : 'text-gray-700'}`}
                  onClick={() => setSettingsTab('password')}
                >Password & Security</li>
                <li
                  className={`font-medium cursor-pointer ${settingsTab === 'email' ? 'text-blue-600' : 'text-gray-700'}`}
                  onClick={() => setSettingsTab('email')}
                >Email Notification</li>
                <li
                  className="text-gray-700 font-medium cursor-pointer"
                  onClick={() => {
                    logout();
                    navigate('/accountmanager/login');
                  }}
                >Logout</li>
              </ul>
            </div>
            <div className="flex-1 flex flex-col items-start pt-16 px-16 w-full">
              {settingsTab === 'account' && <AccountManagerInfo />}
              {settingsTab === 'password' && <PasswordSecurity />}
              {settingsTab === 'email' && <EmailNotification />}
            </div>
          </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AccountManager;
