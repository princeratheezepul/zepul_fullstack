import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { useApi } from '../../../hooks/useApi';

const StatsGroup = () => {
  const { get } = useApi();
  const [stats, setStats] = useState([
    { title: 'Total Jobs', value: '0', percentage: '0', since: 'since last week' },
    { title: 'Candidates in Process', value: '0', percentage: '0', since: 'since last week' },
    { title: 'Interviews Scheduled', value: '0', percentage: '0', since: 'since last week' },
    { title: 'Feedback Pending', value: '0', percentage: '0', since: 'since last week' },
    { title: 'Offers Made', value: '0', percentage: '0', since: 'since last week' },
    { title: 'Success Ratio', value: '48%', percentage: '16.76', since: 'since last week' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs, resumes, and recruiter stats data using useApi hook
      const [jobsResponse, resumesResponse, recruiterStatsResponse] = await Promise.all([
        get(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/assigned-jobs`),
        get(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/recruiter`),
        get(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/stats`)
      ]);

      let totalJobs = 0;
      let screenedCount = 0;
      let scheduledCount = 0;
      let submittedCount = 0;
      let offersMade = 0;

      // Process jobs data
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        totalJobs = jobsData.jobs?.length || 0;
      }

      // Process resumes data
      if (resumesResponse.ok) {
        const resumesData = await resumesResponse.json();
        
        // Extract resumes from the data property
        const resumes = resumesData.data || resumesData;
        
        // Count resumes by status
        resumes.forEach(resume => {
          switch (resume.status) {
            case 'screening':
              screenedCount++;
              break;
            case 'scheduled':
              scheduledCount++;
              break;
            case 'submitted':
              submittedCount++;
              break;
            default:
              break;
          }
        });
      }

      // Process recruiter stats data
      if (recruiterStatsResponse.ok) {
        const recruiterStatsData = await recruiterStatsResponse.json();
        offersMade = recruiterStatsData.stats?.offersMade || 0;
      }

      // Update stats with real data
      setStats([
        { title: 'Total Jobs', value: totalJobs.toString(), percentage: '16.76', since: 'since last week' },
        { title: 'Candidates in Process', value: screenedCount.toString(), percentage: '16.76', since: 'since last week' },
        { title: 'Interviews Scheduled', value: scheduledCount.toString(), percentage: '16.76', since: 'since last week' },
        { title: 'Feedback Pending', value: submittedCount.toString(), percentage: '16.76', since: 'since last week' },
        { title: 'Offers Made', value: offersMade.toString(), percentage: '16.76', since: 'since last week' },
        { title: 'Success Ratio', value: '48%', percentage: '16.76', since: 'since last week' }, // Keep dummy value as requested
      ]);

    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4 lg:mb-6">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-xl shadow animate-pulse">
            <div className="h-3 md:h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 md:h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 h-[12vh] md:h-[14vh]">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          percentage={stat.percentage}
          since={stat.since}
        />
      ))}
    </div>
  );
};

export default StatsGroup; 