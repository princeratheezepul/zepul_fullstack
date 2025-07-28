import React, { useState, useEffect } from 'react';
import { X, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAssignRecruitersSidebar = ({ job, onClose, onAssign }) => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedRecruiters, setSelectedRecruiters] = useState(
    job.assignedRecruiters?.map(r => r._id) || []
  );

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.data?.accessToken;
  const adminId = userInfo?.data?.user?._id;

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getrecruiterbyAdmin/${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecruiters(data.recruiter || []);
      } else {
        console.error('Failed to fetch recruiters');
        toast.error('Failed to fetch recruiters');
      }
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      toast.error('Error fetching recruiters');
    } finally {
      setLoading(false);
    }
  };

  const handleRecruiterToggle = (recruiterId) => {
    setSelectedRecruiters(prev => {
      if (prev.includes(recruiterId)) {
        return prev.filter(id => id !== recruiterId);
      } else {
        return [...prev, recruiterId];
      }
    });
  };

  const handleAssign = async () => {
    try {
      setAssigning(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/assign-recruiters/${job._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recruiterIds: selectedRecruiters
        })
      });

      if (response.ok) {
        toast.success('Recruiters assigned successfully!');
        onAssign();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to assign recruiters');
      }
    } catch (error) {
      console.error('Error assigning recruiters:', error);
      toast.error('Failed to assign recruiters');
    } finally {
      setAssigning(false);
    }
  };

  const getRecruiterStatus = (recruiter) => {
    if (recruiter.status === 'active') {
      return { text: 'Active', className: 'bg-green-100 text-green-700' };
    } else if (recruiter.status === 'disabled') {
      return { text: 'Disabled', className: 'bg-red-100 text-red-700' };
    }
    return { text: 'Unknown', className: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assign Recruiters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{job.jobtitle}</h3>
            <p className="text-sm text-gray-600">Select recruiters to assign to this job</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {recruiters.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recruiters available</p>
                ) : (
                  recruiters.map((recruiter) => {
                    const isSelected = selectedRecruiters.includes(recruiter._id);
                    const status = getRecruiterStatus(recruiter);
                    
                    return (
                      <div
                        key={recruiter._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleRecruiterToggle(recruiter._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-blue-600' : 'bg-gray-200'
                            }`}>
                              {isSelected ? (
                                <Check size={16} className="text-white" />
                              ) : (
                                <Users size={16} className="text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{recruiter.fullname || recruiter.email}</h4>
                              <p className="text-sm text-gray-600">{recruiter.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    {selectedRecruiters.length} recruiter{selectedRecruiters.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={assigning || selectedRecruiters.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? 'Assigning...' : 'Assign Recruiters'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignRecruitersSidebar; 