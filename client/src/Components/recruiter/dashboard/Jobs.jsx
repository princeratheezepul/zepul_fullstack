import React, { useState, useEffect } from 'react';
import JobCard from './JobCard.jsx';
import JobDetails from './JobDetails.jsx';
import CandidateList from './CandidateList.jsx';
import CreateJobManager from './CreateJobManager.jsx';
import JobSidebar from './JobSidebar.jsx';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobCounts, setJobCounts] = useState({ all: 0, opened: 0, urgent: 0, closed: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);

  // Fetch jobs on component mount and when page/filter changes
  useEffect(() => {
    fetchJobs();
    fetchJobCounts();
  }, [currentPage, activeFilter]);

  // Make fetchJobs available globally for other components
  useEffect(() => {
    window.refreshJobs = () => {
      fetchJobs();
      fetchJobCounts();
    };
    return () => {
      delete window.refreshJobs;
    };
  }, [currentPage, activeFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }
      const managerId = userInfo?.data?.user?._id;
      if (!managerId) {
        console.error('No managerId found in user info');
        return;
      }

      // Use the manager jobs endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/get-jobs/${managerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let filteredJobs = data.jobs || [];
        
        // Sort jobs by most recent first
        filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Apply client-side filtering based on activeFilter
        if (activeFilter !== 'all') {
          filteredJobs = filteredJobs.filter(job => {
            // Check if hiring deadline has passed
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            
            switch (activeFilter) {
              case 'opened':
                return !job.isClosed && !isDeadlinePassed;
              case 'urgent':
                return job.priority && job.priority.includes('High') && !job.isClosed && !isDeadlinePassed;
              case 'closed':
                return job.isClosed || isDeadlinePassed;
              default:
                return true;
            }
          });
        }

        // Apply pagination
        const itemsPerPage = 10;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
        
        setJobs(paginatedJobs);
        setTotalJobs(filteredJobs.length);
        setTotalPages(Math.ceil(filteredJobs.length / itemsPerPage));
      } else {
        console.error('Failed to fetch jobs');
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCounts = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }
      const managerId = userInfo?.data?.user?._id;
      if (!managerId) {
        console.error('No managerId found in user info');
        return;
      }

      // Fetch all jobs to calculate counts
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/get-jobs/${managerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allJobs = data.jobs || [];
        
        const counts = {
          all: allJobs.length,
          opened: allJobs.filter(job => {
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            return !job.isClosed && !isDeadlinePassed;
          }).length,
          urgent: allJobs.filter(job => {
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            return job.priority && job.priority.includes('High') && !job.isClosed && !isDeadlinePassed;
          }).length,
          closed: allJobs.filter(job => {
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            return job.isClosed || isDeadlinePassed;
          }).length
        };
        
        setJobCounts(counts);
      } else {
        console.error('Failed to fetch job counts');
      }
    } catch (error) {
      console.error('Error fetching job counts:', error);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getFilterCounts = () => {
    return jobCounts;
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleBack = () => {
    setSelectedJob(null);
    setShowCandidateList(false);
  };

  const handleShowCandidates = () => {
    setShowCandidateList(true);
  };

  const handleBackToJobDetails = () => {
    setShowCandidateList(false);
  };

  const handleJobUpdated = (updatedJob) => {
    // Update the selected job with the new data
    setSelectedJob(updatedJob);
    
    // Refresh the jobs list to reflect changes
    fetchJobs();
    fetchJobCounts();
  };

  if (showCreateJob) {
    return (
      <div className="w-full min-h-screen bg-[#F7F8FA]">
        <CreateJobManager onBack={() => setShowCreateJob(false)} />
      </div>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="bg-gray-50 w-full px-2 sm:px-4 md:px-8 lg:px-16 py-0 min-h-screen relative">
      {/* Jobs List Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 pt-8 border-b border-gray-200 mb-8 gap-4">
        <div className="flex flex-col justify-center">
          <div className="text-3xl font-bold text-black mb-1">Jobs</div>
          <p className="text-base text-gray-500">Manage and track all your job posting here</p>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex gap-4 flex-wrap">
            <div 
              className={`rounded-lg px-6 py-2 text-base font-semibold shadow border border-black cursor-pointer transition-colors ${
                activeFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All Jobs ({filterCounts.all})
            </div>
            <div 
              className={`rounded-lg px-6 py-2 text-base font-semibold border border-black cursor-pointer transition-colors ${
                activeFilter === 'opened' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('opened')}
            >
              Opened Jobs ({filterCounts.opened})
            </div>
            <div 
              className={`rounded-lg px-6 py-2 text-base font-semibold border border-black cursor-pointer transition-colors ${
                activeFilter === 'urgent' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('urgent')}
            >
              Urgent ({filterCounts.urgent})
            </div>
            <div 
              className={`rounded-lg px-6 py-2 text-base font-semibold border border-black cursor-pointer transition-colors ${
                activeFilter === 'closed' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('closed')}
            >
              Closed Jobs ({filterCounts.closed})
            </div>
          </div>
        </div>
        <div
          className="ml-0 md:ml-8 px-10 py-2 rounded-xl border border-blue-500 text-lg font-semibold text-black bg-white hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          style={{ boxShadow: '0 0 0 2px #2563eb' }}
          onClick={() => setShowCreateJob(true)}
        >
          Create Job
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div>
            {jobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {activeFilter === 'all' ? 'No jobs found. Create your first job!' : `No ${activeFilter} jobs found.`}
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard key={job._id || job.id} job={job} onClick={handleJobClick} />
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <div
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Previous
              </div>
              <span className="px-3 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <div
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Next
              </div>
            </div>
          )}
        </>
      )}
      {/* Sidebar for Job Details */}
      <JobSidebar open={!!selectedJob} onClose={handleBack}>
        {selectedJob && !showCandidateList && (
          <JobDetails job={selectedJob} onBack={handleBack} onShowCandidates={handleShowCandidates} onJobUpdated={handleJobUpdated} />
        )}
        {selectedJob && showCandidateList && (
          <CandidateList job={selectedJob} onBack={handleBackToJobDetails} />
        )}
      </JobSidebar>
    </div>
  );
};

export default Jobs; 