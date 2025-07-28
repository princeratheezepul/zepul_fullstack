/**
 * Add sidebar for notes editing, open on message icon click.
 * Make message icon cursor-pointer.
 */
import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminResumeDetailsView from './AdminResumeDetailsView';

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

const AdminSavedResumes = ({ jobId, onBack, jobtitle }) => {
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
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/resumes/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      const data = await response.json();
      console.log('AdminSavedResumes - fetched data:', data);
      setResumes(Array.isArray(data) ? data : []);
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

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/resumes/${resumeId}`, {
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
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
      toast.error(error.message || 'Failed to shortlist candidate');
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

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/resumes/${resumeId}`, {
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
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      toast.error(error.message || 'Failed to reject candidate');
    } finally {
      setActionLoading(prev => ({ ...prev, [resumeId]: false }));
    }
  };

  // Handle save note
  const handleSaveNote = async () => {
    if (!noteSidebar.resume) return;
    
    setNoteSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/resumes/${noteSidebar.resume._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addedNotes: note })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save note');
      }
      
      // Update the resume in the local state
      setResumes(prevResumes => 
        prevResumes.map(resume => 
          resume._id === noteSidebar.resume._id 
            ? { ...resume, addedNotes: note }
            : resume
        )
      );
      
      setNoteMsg('Note saved!');
      setTimeout(() => setNoteMsg(''), 1500);
      // Update resumes in UI
      setResumes(resumes => resumes.map(r => r._id === noteSidebar.resume._id ? { ...r, addedNotes: note } : r));
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setNoteSaving(false);
    }
  };

  const openNoteSidebar = (resume) => {
    setNoteSidebar({ open: true, resume });
    setNote(resume.addedNotes || '');
    setNoteMsg('');
  };

  const closeNoteSidebar = () => {
    setNoteSidebar({ open: false, resume: null });
    setNote('');
  };

  const capitalizeFirstLetter = (str) =>
    str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

  const getAvatarColor = (name) => {
    // Professional, subtle color palette
    const colors = [
      'bg-blue-100 text-blue-700 border border-blue-200',
      'bg-green-100 text-green-700 border border-green-200',
      'bg-purple-100 text-purple-700 border border-purple-200',
      'bg-orange-100 text-orange-700 border border-orange-200',
      'bg-teal-100 text-teal-700 border border-teal-200',
      'bg-indigo-100 text-indigo-700 border border-indigo-200',
      'bg-pink-100 text-pink-700 border border-pink-200',
      'bg-gray-100 text-gray-700 border border-gray-200'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const filteredResumes = filter === 'all' 
    ? resumes 
    : resumes.filter(resume => resume.status === filter);

  if (selectedResume) {
    return (
      <AdminResumeDetailsView 
        resume={selectedResume} 
        onBack={() => setSelectedResume(null)}
        onStatusUpdate={(resumeId, newStatus) => {
          setResumes(prevResumes => 
            prevResumes.map(resume => 
              resume._id === resumeId 
                ? { ...resume, status: newStatus }
                : resume
            )
          );
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white p-6 relative">
      {/* Sidebar overlay */}
      {noteSidebar.open && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-transparent transition-opacity" onClick={closeNoteSidebar}></div>
          {/* Sidebar */}
          <div className="relative ml-auto w-full max-w-md h-full bg-white z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="font-semibold text-lg">
                {noteSidebar.resume?.addedNotes ? 'Edit Notes' : 'Add Notes'} for {noteSidebar.resume?.name}
              </div>
              <button onClick={closeNoteSidebar} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={22} /></button>
            </div>
            <div className="flex-1 p-6">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={noteSidebar.resume?.addedNotes ? "Edit your note..." : "Write your note..."}
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
                {noteSaving ? 'Saving...' : (noteSidebar.resume?.addedNotes ? 'Save' : 'Add')}
              </button>
              {noteMsg && <div className="text-green-600 text-sm mt-2 text-center">{noteMsg}</div>}
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Candidate List</div>
            <p className="text-gray-600">Managing candidate for {jobtitle}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const count = key === 'all' ? filteredResumes.length : filteredResumes.filter(r => r.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filter === key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Candidate Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">No candidates found</div>
            <p className="text-gray-600">No candidates match the current filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <div className="col-span-4">CANDIDATE</div>
                <div className="col-span-2">APPLIED DATE</div>
                <div className="col-span-2">SCORE</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-2">NOTES</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredResumes.map((resume) => (
                <div
                  key={resume._id}
                  onClick={() => setSelectedResume(resume)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* CANDIDATE Column */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div 
                        className={`rounded-full flex items-center justify-center font-medium text-sm shadow-sm flex-shrink-0 ${getAvatarColor(resume.name)}`}
                        style={{
                          width: '42px !important',
                          height: '42px !important',
                          minWidth: '42px',
                          minHeight: '42px'
                        }}
                      >
                        {getInitials(resume.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-gray-900 truncate">{capitalizeFirstLetter(resume.name)}</span>
                        <span className="text-sm text-gray-600 truncate">{resume.email}</span>
                      </div>
                    </div>

                    {/* APPLIED DATE Column */}
                    <div className="col-span-2 text-gray-900 text-sm">
                      {formatDate(resume.createdAt)}
                    </div>

                    {/* SCORE Column */}
                    <div className="col-span-2 text-gray-900 text-sm">
                      {resume.overallScore ? `${resume.overallScore}%` : 'N/A'}
                    </div>

                    {/* STATUS Column */}
                    <div className="col-span-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[resume.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[resume.status] || resume.status}
                      </span>
                    </div>

                    {/* NOTES Column */}
                    <div className="col-span-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openNoteSidebar(resume);
                        }}
                        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                          resume.addedNotes 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        title={resume.addedNotes ? 'Edit existing notes' : 'Add notes'}
                      >
                        <MessageSquare size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSavedResumes; 