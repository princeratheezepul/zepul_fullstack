import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssignRecruitersSidebar from './AssignRecruitersSidebar';

const PRIORITY_OPTIONS = [
  { label: 'High', color: 'bg-red-100 text-red-600' },
  { label: 'Medium', color: 'bg-yellow-100 text-yellow-600' },
  { label: 'Low', color: 'bg-green-100 text-green-600' },
];

const JobDetails = ({ job, onBack, onJobUpdated, recruiters = [] }) => {
  // Handle priority as array - get first element or default to 'High'
  const [priority, setPriority] = useState(job.priority && job.priority.length > 0 ? job.priority[0] : 'High');
  const [priorityDropdown, setPriorityDropdown] = useState(false);
  const [internalNotes, setInternalNotes] = useState(job.internalNotes || '');
  const [skills, setSkills] = useState(job.skills || []);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(job.updatedAt);
  const [sendNotification, setSendNotification] = useState(false);
  const [showAssignSidebar, setShowAssignSidebar] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.data?.accessToken;
  const managerId = userInfo?.data?.user?._id;

  // Created by user - determine creator based on adminId or managerId
  const getCreatorInfo = () => {
    if (job.adminId) {
      return {
        name: job.adminId.fullname || job.adminId.username || 'Unknown',
        role: 'Admin'
      };
    } else if (job.managerId) {
      return {
        name: job.managerId.fullname || job.managerId.username || 'Unknown',
        role: 'Manager'
      };
    }
    return {
      name: 'Unknown',
      role: 'Unknown'
    };
  };

  const creatorInfo = getCreatorInfo();

  // Date formatting helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Priority dropdown logic
  const currentPriority = PRIORITY_OPTIONS.find(opt => opt.label === priority) || PRIORITY_OPTIONS[0];

  const handlePrioritySelect = (label) => {
    setPriority(label);
    setPriorityDropdown(false);
  };

  // Skills logic
  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
      setShowSkillInput(false);
    }
  };
  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!token) {
        toast.error('No authentication token found');
        setSaving(false);
        return;
      }
      // Use the correct endpoint for updating a job (adjust if needed)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/job/${job._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priority,
          internalNotes,
          skills,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update job');
      }
      const data = await response.json();
      setUpdatedAt(data.job.updatedAt);
      toast.success('All changes saved');
      
      // Call the callback to refresh the job list
      if (onJobUpdated) {
        onJobUpdated(data.job);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Fetch updated job details after assigning recruiters
  const refreshJob = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/get-jobs/${managerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.jobs.find(j => j._id === job._id);
        if (updated && onJobUpdated) onJobUpdated(updated);
      }
    } catch {}
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Main Form */}
      <div className="flex-1 p-6 md:p-10">
        <div className="text-xs text-blue-600 font-semibold mb-2">JOB DETAILS</div>
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Edit Job Setting</h1>
        <form className="space-y-8" onSubmit={handleSave}>
          {/* Priority */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Priority</label>
            <div className="relative inline-block">
              <button
                type="button"
                className={`px-4 py-1 rounded-full font-semibold text-sm focus:outline-none border border-gray-200 ${currentPriority.color} flex items-center gap-2 min-w-[90px] cursor-pointer`}
                onClick={() => setPriorityDropdown(v => !v)}
              >
                {priority}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {priorityDropdown && (
                <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                  {PRIORITY_OPTIONS.filter(opt => opt.label !== priority).map(opt => (
        <button 
                      key={opt.label}
                      type="button"
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${opt.color} cursor-pointer`}
                      onClick={() => handlePrioritySelect(opt.label)}
                    >
                      {opt.label}
        </button>
                  ))}
              </div>
            )}
            </div>
          </div>
          {/* Internal Notes */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Internal Notes</label>
            <textarea
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base min-h-[90px]"
              placeholder="Internal comments on job status, priorities, or special instructions"
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
            />
          </div>
          {/* Recruiters */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Assigned Recruiters</label>
            <div className="max-h-[140px] overflow-y-auto border border-gray-200 rounded-lg mb-4">
              {job.assignedRecruiters && job.assignedRecruiters.length > 0 ? (
                <div className="space-y-2 p-2">
                  {job.assignedRecruiters.map((recruiter, idx) => (
                    <div key={recruiter._id || idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(recruiter.fullname || recruiter.email)}&background=random`} 
                          alt={recruiter.fullname || recruiter.email} 
                          className="w-10 h-10 rounded-full border-2 border-white shadow" 
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{recruiter.fullname || 'No Name'}</div>
                          <div className="text-xs text-gray-500">{recruiter.email}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${(recruiter.isActive === true || (recruiter.status && recruiter.status.toLowerCase() === 'active')) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {(recruiter.isActive === true || (recruiter.status && recruiter.status.toLowerCase() === 'active')) ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                  No recruiters assigned to this job
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                className="px-4 py-2 border border-blue-500 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer" 
                onClick={() => setShowAssignSidebar(true)}
              >
                {job.assignedRecruiters && job.assignedRecruiters.length > 0 ? 'Manage Recruiters' : 'Assign Recruiters'}
              </button>
            </div>
            
          </div>
          {/* Save Button */}
          <div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-2 font-semibold shadow-none cursor-pointer disabled:opacity-50" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
          </div>
      {/* Sidebar Info */}
      <div className="w-full max-w-xs bg-[#FAFAFA] border-l border-gray-200 p-6 md:p-8 flex flex-col gap-8">
        {/* Created By */}
        <div className="flex items-center gap-3">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Created By" className="w-12 h-12 rounded-full border-2 border-blue-600 object-cover" />
          <div>
            <div className="text-xs text-gray-500">Created By</div>
            <div className="font-semibold text-gray-900">{creatorInfo.name}</div>
            <div className="text-xs text-gray-400">{creatorInfo.role}</div>
          </div>
        </div>
        {/* Deadline */}
          <div>
          <div className="text-xs text-gray-500 mb-1">Hiring Deadline</div>
          <div className="flex items-center gap-2">
            <div className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 text-sm w-full">{job.hiringDeadline ? formatDate(job.hiringDeadline) : 'No deadline set'}</div>
          </div>
            </div>
        {/* Skills (moved here) */}
            <div>
          <div className="text-xs text-gray-500 mb-1">Skills</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                {skill}
                <button type="button" className="ml-1 text-xs text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => handleRemoveSkill(skill)}>&times;</button>
              </span>
            ))}
            </div>
          {showSkillInput ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
                placeholder="Add Tag"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                autoFocus
              />
              <button type="button" className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={handleAddSkill}>Add</button>
              <button type="button" className="text-gray-400 hover:text-gray-700 px-2 cursor-pointer" onClick={() => { setShowSkillInput(false); setNewSkill(''); }}>&times;</button>
            </div>
          ) : (
            <button type="button" className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => setShowSkillInput(true)}>+ Add Tag</button>
          )}
        </div>
        {/* Created/Updated */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Created</div>
          <div className="text-sm text-gray-700 mb-2">{formatDateTime(job.createdAt)}</div>
          <div className="text-xs text-gray-500 mb-1">Updated</div>
          <div className="text-sm text-gray-700">{formatDateTime(updatedAt)}</div>
        </div>
      </div>
      {/* Assign Recruiters Sidebar Overlay */}
      <AssignRecruitersSidebar
        open={showAssignSidebar}
        onClose={() => setShowAssignSidebar(false)}
        jobId={job._id}
        initialAssigned={job.assignedRecruiters || []}
        managerId={managerId}
        token={token}
        recruiters={recruiters}
        onSaveSuccess={refreshJob}
      />
    </div>
  );
};

export default JobDetails; 