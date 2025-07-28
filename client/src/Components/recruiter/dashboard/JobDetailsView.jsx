import React from 'react';

const JobDetailsView = ({ job, onBack }) => {
  // Dummy statistics for now; replace with real data as needed
  const stats = {
    total: job.totalApplication_number || 0,
    shortlisted: job.shortlisted || 0,
    interviewed: job.interviewed || 0,
    secondRound: job.secondRoundInterviewed || 0,
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full h-full">
      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl shadow p-6 md:p-10 mb-6 md:mb-0">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline font-semibold">&larr; Back</button>
        <h2 className="text-2xl font-bold mb-2">Job Description:</h2>
        <p className="text-gray-700 mb-6 whitespace-pre-line">{job.description}</p>
        <h3 className="text-lg font-semibold mb-2">Key Responsibilities:</h3>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          {(job.responsibilities || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold mb-2">Required Skills & Experience:</h3>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          {(job.requiredSkills || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        {job.preferredQualifications && job.preferredQualifications.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-2">Preferred Qualifications (Nice to Have):</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              {job.preferredQualifications.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      {/* Sidebar Statistics */}
      <div className="w-full md:w-80 flex-shrink-0 bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <h4 className="text-lg font-semibold mb-4">Application Statistics</h4>
        <div className="relative flex items-center justify-center mb-4">
          <svg className="w-32 h-32" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="#2563EB" strokeWidth="12" strokeDasharray="339.292" strokeDashoffset={339.292 - (stats.total / 120) * 339.292} strokeLinecap="round" />
          </svg>
          <span className="absolute text-3xl font-bold text-gray-800">{stats.total}</span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>Total Application</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-black inline-block"></span>Shortlisted</span>
            <span className="font-semibold">{stats.shortlisted}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-800 inline-block"></span>Interviewed</span>
            <span className="font-semibold">{stats.interviewed}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>2nd round Interviewed</span>
            <span className="font-semibold">{stats.secondRound}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsView; 