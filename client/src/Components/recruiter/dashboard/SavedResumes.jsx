/**
 * Add sidebar for notes editing, open on message icon click.
 * Make message icon cursor-pointer.
 */
import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, X } from 'lucide-react';
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
  scheduled: 'bg-yellow-100 text-yellow-800',
  screening: 'bg-blue-100 text-blue-800',
  submitted: 'bg-purple-100 text-purple-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
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

  useEffect(() => {
    fetchResumes();
  }, [jobId]);

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/job/${jobId}`);
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

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${noteSidebar.resume._id}`, {
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

  if (selectedResume) {
    return <ResumeDetailsView resumeData={selectedResume} onBack={() => setSelectedResume(null)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="text-lg">Loading resumes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white p-4 relative">
      {/* Sidebar overlay */}
      {noteSidebar.open && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-transparent transition-opacity" onClick={closeNoteSidebar}></div>
          {/* Sidebar */}
          <div className="relative ml-auto w-full max-w-md h-full bg-white shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="font-semibold text-lg">Add Notes for {noteSidebar.resume?.name}</div>
              <button onClick={closeNoteSidebar} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={22} /></button>
            </div>
            <div className="flex-1 p-6">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[120px]"
                placeholder="Write your note"
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={noteSaving}
              ></textarea>
            </div>
            <div className="p-6 border-t">
              <button
                className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer ${noteSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Candidate List</h1>
            <div className="text-gray-500 text-sm mt-1">Managing candidate for {capitalizeFirstLetter(jobtitle || '')}</div>
          </div>
          {/* Filter Tabs */}
          <div className="flex gap-2 mt-2 sm:mt-0">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors focus:outline-none ${
                  filter === key
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                } cursor-pointer`}
                style={{ minWidth: 110 }}
                onClick={() => setFilter(key)}
              >
                {label} ({statusCounts[key]})
              </button>
            ))}
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applied date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredResumes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Yet</h3>
                    <p className="text-gray-500">Resumes submitted for this job will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredResumes.map((resume) => (
                  <tr
                    key={resume._id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={e => {
                      // Prevent click if notes button is clicked
                      if (e.target.closest('.notes-btn')) return;
                      setSelectedResume(resume);
                    }}
                  >
                    {/* Candidate */}
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${resume.name}`}
                        alt={resume.name}
                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 leading-tight">{resume.name}</div>
                        <div className="text-gray-500 text-sm">{resume.email}</div>
                      </div>
                    </td>
                    {/* Applied date */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {resume.applicationDetails?.date || '-'}
                    </td>
                    {/* Score */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                      {resume.overallScore ? `${resume.overallScore}%` : '-'}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[resume.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[resume.status] || resume.status}
                      </span>
                    </td>
                    {/* Notes */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="notes-btn bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 transition-colors cursor-pointer"
                        title="Add/View Notes"
                        onClick={e => { e.stopPropagation(); openNoteSidebar(resume); }}
                      >
                        <MessageSquare size={18} />
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