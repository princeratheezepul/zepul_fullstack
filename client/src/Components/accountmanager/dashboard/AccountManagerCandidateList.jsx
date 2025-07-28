import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AccountManagerResumeDetailsView from './AccountManagerResumeDetailsView';

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

const AccountManagerCandidateList = ({ job, onBack }) => {
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
  }, [job.jobId]);

  const fetchResumes = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      console.log('Fetching resumes for job:', job.jobId);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/job/${job.jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch resumes: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('AccountManagerCandidateList - fetched data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
      
      // Transform scorecard data to match expected resume structure
      const transformedResumes = Array.isArray(data) ? data.map(scorecard => {
        console.log('Processing scorecard:', scorecard);
        return {
          _id: scorecard._id,
          name: scorecard.resume?.name || scorecard.candidateId?.name || 'Unknown',
          email: scorecard.resume?.email || scorecard.candidateId?.email || 'Unknown',
          phone: scorecard.resume?.phone || scorecard.candidateId?.phone || '',
          location: scorecard.resume?.location || scorecard.candidateId?.location || '',
          experience: scorecard.resume?.experience || scorecard.candidateId?.experience || '',
          title: scorecard.resume?.title || scorecard.candidateId?.title || '',
          skills: scorecard.resume?.skills || scorecard.candidateId?.skills || [],
          about: scorecard.resume?.about || scorecard.candidateId?.about || '',
          content: scorecard.resume?.content || scorecard.candidateId?.content || '',
          overallScore: scorecard.resume?.overallScore || scorecard.candidateId?.overallScore || 0,
          ats_score: scorecard.resume?.ats_score || scorecard.candidateId?.ats_score || 0,
          aiSummary: scorecard.resume?.aiSummary || scorecard.candidateId?.aiSummary || {},
          aiScorecard: scorecard.resume?.aiScorecard || scorecard.candidateId?.aiScorecard || {},
          keyStrength: scorecard.resume?.keyStrength || scorecard.candidateId?.keyStrength || [],
          potentialConcern: scorecard.resume?.potentialConcern || scorecard.candidateId?.potentialConcern || [],
          interviewEvaluation: scorecard.resume?.interviewEvaluation || scorecard.candidateId?.interviewEvaluation || {},
          applicationDetails: scorecard.resume?.applicationDetails || scorecard.candidateId?.applicationDetails || {},
          status: scorecard.status || 'submitted',
          addedNotes: scorecard.addedNotes || '',
          createdAt: scorecard.resume?.createdAt || scorecard.candidateId?.createdAt || scorecard.createdAt,
          // Keep original resume and candidateId for reference
          originalResume: scorecard.resume,
          originalCandidateId: scorecard.candidateId,
          scorecardId: scorecard._id
        };
      }) : [];
      
      console.log('Transformed resumes:', transformedResumes);
      setResumes(transformedResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error(`Failed to fetch candidates: ${error.message}`);
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

      // Find the resume to get the scorecard ID
      const resume = resumes.find(r => r._id === resumeId);
      const scorecardId = resume?.scorecardId || resumeId;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/${scorecardId}`, {
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
      
      toast.success('Candidate shortlisted successfully');
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

      // Find the resume to get the scorecard ID
      const resume = resumes.find(r => r._id === resumeId);
      const scorecardId = resume?.scorecardId || resumeId;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/${scorecardId}`, {
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
      
      toast.success('Candidate rejected successfully');
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
    setNoteMsg('');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use the scorecard ID for API calls
      const scorecardId = noteSidebar.resume?.scorecardId || noteSidebar.resume._id;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/${scorecardId}`, {
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
      
      // Update the resume in the local state
      setResumes(prevResumes => 
        prevResumes.map(resume => 
          resume._id === noteSidebar.resume._id 
            ? { ...resume, addedNotes: note }
            : resume
        )
      );
      
      setNoteMsg('Note saved successfully!');
      setTimeout(() => setNoteMsg(''), 3000);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(error.message || 'Failed to save note');
    } finally {
      setNoteSaving(false);
    }
  };

  const openNoteSidebar = (resume) => {
    setNoteSidebar({ open: true, resume });
    setNote(resume.addedNotes || '');
  };

  const closeNoteSidebar = () => {
    setNoteSidebar({ open: false, resume: null });
    setNote('');
    setNoteMsg('');
  };

  const capitalizeFirstLetter = (str) =>
    str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
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
      <AccountManagerResumeDetailsView 
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
            <h1 className="text-2xl font-bold text-gray-900">Candidate List</h1>
            <p className="text-gray-600">Managing candidate for {job.jobtitle}</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">No candidates match the current filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <div>CANDIDATE</div>
                <div>APPLIED DATE</div>
                <div>SCORE</div>
                <div>STATUS</div>
                <div>NOTES</div>
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
                  <div className="grid grid-cols-5 gap-4 items-center">
                    {/* CANDIDATE Column */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(resume.name)}`}>
                        {getInitials(resume.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{capitalizeFirstLetter(resume.name)}</span>
                        <span className="text-sm text-gray-600">{resume.email}</span>
                      </div>
                    </div>

                    {/* APPLIED DATE Column */}
                    <div className="text-gray-900">
                      {formatDate(resume.createdAt)}
                    </div>

                    {/* SCORE Column */}
                    <div className="text-gray-900">
                      {resume.overallScore ? `${resume.overallScore}%` : 'N/A'}
                    </div>

                    {/* STATUS Column */}
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[resume.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[resume.status] || resume.status}
                      </span>
                    </div>

                    {/* NOTES Column */}
                    <div>
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

export default AccountManagerCandidateList; 