import React, { useState } from 'react';
import Header from '../Components/recruiter/dashboard/Header';
import StatsGroup from '../Components/recruiter/dashboard/StatsGroup';
import CandidateSubmissionChart from '../Components/recruiter/dashboard/CandidateSubmissionChart';
import TotalApplicationsChart from '../Components/recruiter/dashboard/TotalApplicationsChart';
import AverageScore from '../Components/recruiter/dashboard/AverageScore';
import ShortlistChart from '../Components/recruiter/dashboard/ShortlistChart';
import Sidebar from '../Components/recruiter/dashboard/Sidebar';
import RecruiterJobs from '../Components/recruiter/dashboard/RecruiterJobs';
import Settings from '../Components/recruiter/dashboard/Settings';


const RecruiterDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('Dashboard');

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      {activeComponent === 'Settings' ? (
        <Settings />
      ) : (
        <main className="flex-1 ml-20 p-6">
          {activeComponent === 'Dashboard' && (
            <div className="flex flex-col">
              <Header />
              <StatsGroup />
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-6">
                <CandidateSubmissionChart />
                <TotalApplicationsChart />
              </div>
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                <div className="md:w-1/3">
                  <AverageScore />
                </div>
                <div className="md:w-2/3">
                  <ShortlistChart />
                </div>
              </div>
            </div>
          )}
          {activeComponent === 'Jobs' && <RecruiterJobs />}
        </main>
      )}
    </div>
  );
};

export default RecruiterDashboard;