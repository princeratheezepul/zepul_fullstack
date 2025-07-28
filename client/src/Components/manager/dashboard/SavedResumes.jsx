/**
 * Add sidebar for notes editing, open on message icon click.
 * Make message icon cursor-pointer.
 */
import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ResumeDetailsView from './ResumeDetailsView';

const STATUS_LABELS = {
  all: 'All',
  screening: 'In screen',
  scheduled: 'Scheduled',
  rejected: 'Rejected',
  shortlisted: 'Shortlisted',
  submitted: 'Submitted',
};

const STATUS_COLORS = {
  scheduled: 'bg-yellow-100 text-yellow-700',
  screening: 'bg-blue-100 text-blue-700',
  submitted: 'bg-purple-100 text-purple-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const SavedResumes = ({ jobId, onBack, jobtitle }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [filter, setFilter] = useState('all');
  const [noteSidebar, setNoteSidebar] = useState({ open: false, resume: null });
  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMsg, setNoteMsg] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchResumes();
  }, [jobId]);

  const fetchResumes = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle shortlist action
  const handleShortlist = async (resumeId, e) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [resumeId]: true }));
    
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'shortlisted' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to shortlist candidate');
      }
      
      // Update the resume in the local state
      setResumes(prevResumes => 
        prevResumes.map(resume => 
          resume._id === resumeId 
            ? { ...resume, status: 'shortlisted' }
            : resume
        )
      );
      
      // Show success message
      toast.success('Candidate shortlisted successfully!');
    } catch (err) {
      console.error('Error shortlisting candidate:', err);
      toast.error(`Failed to shortlist candidate: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [resumeId]: false }));
    }
  };

  // Handle reject action
  const handleReject = async (resumeId, e) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [resumeId]: true }));
    
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject candidate');
      }
      
      // Update the resume in the local state
      setResumes(prevResumes => 
        prevResumes.map(resume => 
          resume._id === resumeId 
            ? { ...resume, status: 'rejected' }
            : resume
        )
      );
      
      // Show success message
      toast.success('Candidate rejected successfully!');
    } catch (err) {
      console.error('Error rejecting candidate:', err);
      toast.error(`Failed to reject candidate: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [resumeId]: false }));
    }
  };

  // Count for each status
  const statusCounts = resumes.reduce(
    (acc, r) => {
      acc.all++;
      if (r.status && acc[r.status] !== undefined) acc[r.status]++;
      return acc;
    },
    { all: 0, screening: 0, scheduled: 0, rejected: 0, shortlisted: 0, submitted: 0 }
  );

  // Filtered resumes
  const filteredResumes = filter === 'all' ? resumes : resumes.filter(r => r.status === filter);

  // Sidebar note save handler
  const handleSaveNote = async () => {
    if (!noteSidebar.resume?._id) return;
    setNoteSaving(true);
    setNoteMsg('');
    try {
      // Get the correct token from userInfo
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${noteSidebar.resume._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addedNotes: note })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }
      
      const result = await response.json();
      setNoteMsg('Note saved!');
      setTimeout(() => setNoteMsg(''), 1500);
      // Update resumes in UI
      setResumes(resumes => resumes.map(r => r._id === noteSidebar.resume._id ? { ...r, addedNotes: note } : r));
    } catch (err) {
      console.error('Error saving note:', err);
      setNoteMsg(`Failed to save note: ${err.message}`);
    } finally {
      setNoteSaving(false);
    }
  };

  // Open sidebar for a candidate
  const openNoteSidebar = (resume) => {
    setNoteSidebar({ open: true, resume });
    setNote(resume.addedNotes || '');
    setNoteMsg('');
  };
  const closeNoteSidebar = () => {
    setNoteSidebar({ open: false, resume: null });
    setNote('');
    setNoteMsg('');
  };

  // Capitalize first letter of each word
  const capitalizeFirstLetter = (str) =>
    str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

  // Generate avatar colors based on name
  const getAvatarColor = (name) => {
    if (!name) return 'bg-blue-500';
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  if (selectedResume) {
    return <ResumeDetailsView resumeData={selectedResume} onBack={() => setSelectedResume(null)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-lg">Loading resumes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-50 p-6 relative">
      {/* Sidebar overlay */}
      {noteSidebar.open && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-transparent transition-opacity" onClick={closeNoteSidebar}></div>
          {/* Sidebar */}
          <div className="relative ml-auto w-full max-w-md h-full bg-white z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="font-semibold text-lg">Add Notes for {noteSidebar.resume?.name}</div>
              <button onClick={closeNoteSidebar} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={22} /></button>
            </div>
            <div className="flex-1 p-6">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your note"
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={noteSaving}
              ></textarea>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer ${noteSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleSaveNote}
                disabled={noteSaving}
              >
                {noteSaving ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : null}
                {noteSaving ? 'Saving...' : 'Add'}
              </button>
              {noteMsg && <div className="text-green-600 text-sm mt-2 text-center">{noteMsg}</div>}
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-3xl font-bold text-gray-900">Candidate List</div>
          </div>
          <div className="text-gray-500 text-base">Managing candidate for {capitalizeFirstLetter(jobtitle || '')}</div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                filter === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } cursor-pointer`}
              onClick={() => setFilter(key)}
            >
              {label} ({statusCounts[key]})
            </button>
          ))}
        </div>
        
        {/* Table */}
        <div className="bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CANDIDATE</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLIED DATE</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SCORE</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOTES</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredResumes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No candidates found for this filter.
                  </td>
                </tr>
              ) : (
                filteredResumes.map((resume) => (
                  <tr key={resume._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedResume(resume)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full ${getAvatarColor(resume.name)} flex items-center justify-center`}>
                            <span className="text-white font-medium text-sm">
                              {getInitials(resume.name)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{resume.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{resume.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(resume.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {resume.overallScore || resume.ats_score ? `${resume.overallScore || resume.ats_score}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[resume.status] || 'bg-gray-100 text-gray-700'}`}>
                        {resume.status ? capitalizeFirstLetter(resume.status) : 'Submitted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openNoteSidebar(resume);
                        }}
                        className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
                      >
                        <MessageSquare size={16} className="text-white" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SavedResumes; 