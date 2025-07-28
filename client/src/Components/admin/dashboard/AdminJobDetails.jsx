import React from 'react';
import { MapPin, Briefcase, Calendar, Users, IndianRupee, CalendarDays } from 'lucide-react';

const AdminJobDetails = ({ job, onBack, onShowCandidates, onJobUpdated }) => {
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

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Urgent':
        return 'bg-red-100 text-red-700';
      case 'New':
        return 'bg-blue-100 text-blue-700';
      case 'Closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{job.jobtitle}</h2>
          <p className="text-gray-600 mt-1">{job.company || 'Company Name'}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onShowCandidates}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <Users size={18} />
            View Candidates
          </button>
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Job Status */}
      {job.status && (
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
      )}

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <MapPin size={20} className="text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold">{job.location}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Briefcase size={20} className="text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Employment Type</p>
            <p className="font-semibold">{job.employmentType || 'Full-time'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Calendar size={20} className="text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Experience</p>
            <p className="font-semibold">{job.experience || 'Not specified'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <IndianRupee size={20} className="text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Salary</p>
            <p className="font-semibold">
              {job.salary?.min && job.salary?.max 
                ? `₹${job.salary.min}–₹${job.salary.max}` 
                : 'Not specified'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <CalendarDays size={20} className="text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Posted</p>
            <p className="font-semibold">{formatDate(job.createdAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Users size={20} className="text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Applications</p>
            <p className="font-semibold">{job.totalApplication_number || 0}</p>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Job Description</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      {/* Key Responsibilities */}
      {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Key Responsibilities</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="list-disc pl-6 text-gray-700">
              {job.keyResponsibilities.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Required Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Required Skills</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="list-disc pl-6 text-gray-700">
              {job.skills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Preferred Qualifications */}
      {job.preferredQualifications && job.preferredQualifications.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Preferred Qualifications</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="list-disc pl-6 text-gray-700">
              {job.preferredQualifications.map((qual, idx) => (
                <li key={idx}>{qual}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Job Creator Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Job Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Created by:</p>
            <p className="font-semibold">
              {job.adminId?.fullname || job.managerId?.fullname || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Role:</p>
            <p className="font-semibold">
              {job.adminId ? 'Admin' : job.managerId ? 'Manager' : 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Created on:</p>
            <p className="font-semibold">{formatDate(job.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-600">Last updated:</p>
            <p className="font-semibold">{formatDate(job.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobDetails; 