import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, MapPin } from 'lucide-react';

const AdminCandidateList = ({ job, onBack }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.data?.accessToken;

  useEffect(() => {
    fetchCandidates();
  }, [job._id]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/job/${job._id}/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      } else {
        console.error('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'applied': { text: 'Applied', className: 'bg-blue-100 text-blue-700' },
      'shortlisted': { text: 'Shortlisted', className: 'bg-yellow-100 text-yellow-700' },
      'interviewed': { text: 'Interviewed', className: 'bg-purple-100 text-purple-700' },
      '2nd_round': { text: '2nd Round', className: 'bg-indigo-100 text-indigo-700' },
      'offered': { text: 'Offered', className: 'bg-green-100 text-green-700' },
      'hired': { text: 'Hired', className: 'bg-emerald-100 text-emerald-700' },
      'rejected': { text: 'Rejected', className: 'bg-red-100 text-red-700' }
    };
    
    return statusConfig[status] || { text: status, className: 'bg-gray-100 text-gray-700' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Candidates</h2>
          <p className="text-sm text-gray-600">{job.jobtitle}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
              <p className="text-gray-600">Candidates will appear here once they apply for this job.</p>
            </div>
          ) : (
            candidates.map((candidate) => {
              const status = getStatusBadge(candidate.status);
              
              return (
                <div
                  key={candidate._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {candidate.fullname?.charAt(0)?.toUpperCase() || candidate.email?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {candidate.fullname || 'Unknown Name'}
                          </h3>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {candidate.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{candidate.location}</span>
                          </div>
                        )}
                        {candidate.appliedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Applied {formatDate(candidate.appliedAt)}</span>
                          </div>
                        )}
                      </div>
                      
                      {candidate.coverLetter && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {candidate.coverLetter}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCandidateList; 