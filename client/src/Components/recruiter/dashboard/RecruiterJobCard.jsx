import React from 'react';
import { Briefcase, MapPin, Calendar, Users } from 'lucide-react';

const RecruiterJobCard = ({ job, onClick }) => {
  // Function to truncate description to 3 lines
  const truncateDescription = (text, maxLines = 3) => {
    if (!text) return '';
    const lines = text.split('\n');
    const truncatedLines = lines.slice(0, maxLines);
    const result = truncatedLines.join('\n');
    return result + (lines.length > maxLines ? '...' : '');
  };

  // Function to get company display info
  const getCompanyDisplay = () => {
    if (job.company) {
      // If job has company name, show it
      return {
        type: 'letter',
        content: job.company.charAt(0)?.toUpperCase() || 'C',
        name: job.company
      };
    } else if (job.companyId) {
      // If company has a logo, show it, otherwise show first letter
      return {
        type: 'logo',
        content: job.companyLogo || job.companyName?.charAt(0)?.toUpperCase() || 'C',
        name: job.companyName || 'Company'
      };
    } else {
      // Admin created job
      return {
        type: 'letter',
        content: 'A',
        name: 'Admin'
      };
    }
  };

  // Function to check if hiring deadline has passed
  const isDeadlinePassed = () => {
    if (job.hiringDeadline) {
      const deadlineDate = new Date(job.hiringDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      return deadlineDate < today;
    }
    return false;
  };

  // Function to determine job status badge
  const getJobStatus = () => {
    // Check if job is closed
    if (job.isClosed) {
      return { text: 'Close', className: 'bg-gray-200 text-gray-700' };
    }
    
    // Check if hiring deadline has passed
    if (job.hiringDeadline) {
      const deadlineDate = new Date(job.hiringDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      if (deadlineDate < today) {
        return { text: 'Close', className: 'bg-red-100 text-red-700' };
      }
    }
    
    // Check if priority is high (urgent)
    if (job.priority && job.priority.includes('High')) {
      return { text: 'Urgent', className: 'bg-yellow-100 text-yellow-700' };
    }
    
    // Check if job was created within 7 days (new)
    const createdAt = new Date(job.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
      return { text: 'New', className: 'bg-green-100 text-green-700' };
    }
    
    return null; // No status badge
  };

  const companyInfo = getCompanyDisplay();
  const jobStatus = getJobStatus();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col relative cursor-pointer" onClick={() => onClick && onClick(job)}>
      <div className="absolute top-4 right-4">
        {jobStatus && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${jobStatus.className}`}>
            {jobStatus.text}
          </span>
        )}
      </div>
      <div className="pr-16">
        <div className="text-xl font-bold text-gray-800">{job.jobtitle}</div>
        <p className="text-gray-600 mt-2 text-sm max-w-2xl whitespace-pre-line" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {truncateDescription(job.description)}
        </p>
      </div>
      <div className="mt-4 pt-4 flex justify-between items-end">
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            {companyInfo.type === 'logo' && job.companyLogo ? (
              <img src={job.companyLogo} alt={companyInfo.name} className="w-5 h-5" />
            ) : (
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                {companyInfo.content}
              </div>
            )}
            <span className="font-medium text-gray-700">{companyInfo.name}</span>
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2 py-1">
            <MapPin size={16} className="text-gray-400" />
            <span>{job.type} - {job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2 py-1">
            <Briefcase size={16} className="text-gray-400" />
            <span>{job.employmentType || 'Full-time'} • {job.openpositions || 1} opening{job.openpositions !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2 py-1">
            <Calendar size={16} className="text-gray-400" />
            <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 font-medium px-3 py-2 rounded-lg">
            <Users size={18} className="text-gray-500"/>
            <span>{job.totalApplication_number || 0} Applicants Submitted</span>
          </div>
          {!job.isClosed && !isDeadlinePassed() && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
              Submit Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterJobCard; 