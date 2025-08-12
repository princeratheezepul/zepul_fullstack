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
        <main className="flex-1 ml-20 p-4 md:p-2 pt-2 md:pt-1">
          {activeComponent === 'Dashboard' && (
            <div className="flex flex-col space-y-3 md:space-y-6 md:h-[calc(100vh-16px)]">
              <div className="md:h-[5vh]">
                <Header />
              </div>
              <div className="md:h-[16vh]">
                <StatsGroup />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 md:gap-2 md:h-[38vh]">
                <div className="h-[300px] md:h-full">
                  <CandidateSubmissionChart />
                </div>
                <div className="h-[300px] md:h-full">
                  <TotalApplicationsChart />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-2 md:h-[35vh]">
                <div className="h-[250px] md:h-full md:w-1/3">
                  <AverageScore />
                </div>
                <div className="h-[250px] md:h-full md:w-2/3">
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