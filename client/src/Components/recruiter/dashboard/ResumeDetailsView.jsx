import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Briefcase, Plus, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AIInterviewQuestions from './AIInterviewQuestions';
import InterviewTranscript from './InterviewTranscript';

// A simple progress bar component
const ProgressBar = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-1.5">
    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${value}%` }}></div>
  </div>
);

const ResumeDetailsView = ({ resumeData, onBack }) => {
  const navigate = useNavigate();
  // Guard: If no _id, show error and redirect
  useEffect(() => {
    if (!resumeData || !resumeData._id) {
      // Redirect to job details after a short delay
      const timeout = setTimeout(() => {
        navigate(-1); // Go back one page
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [resumeData, navigate]);
  if (!resumeData || !resumeData._id) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: No resume ID found. Redirecting to job details...
      </div>
    );
  }

  // Use jobId from resumeData instead of separate jobDetails prop
  const jobDetails = resumeData.jobId || {};

  const [showInterviewQuestions, setShowInterviewQuestions] = useState(false);
  const [referredToManager, setReferredToManager] = useState(resumeData.referredToManager || false);
  
  // Debug logging
  console.log('ResumeDetailsView - jobDetails:', jobDetails);
  console.log('ResumeDetailsView - resumeData:', resumeData);
  console.log('ResumeDetailsView - resumeData.jobId:', resumeData.jobId);
  console.log('ResumeDetailsView - jobDetails?.internalNotes:', jobDetails?.internalNotes);
  console.log('ResumeDetailsView - resumeData.jobId?.internalNotes:', resumeData.jobId?.internalNotes);
  console.log('ResumeDetailsView - resumeData.addedNotes:', resumeData.addedNotes);
  
  
  
  const [note, setNote] = useState(resumeData.addedNotes || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Helper to determine match label and color
  const getMatchLabel = (score) => {
    if (score >= 80) return { label: 'Strong Match', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { label: 'Good Match', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { label: 'Less Match', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const match = getMatchLabel(resumeData.overallScore);

  const handleSaveNote = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      // Get the correct token from userInfo
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Always save to resume's addedNotes field (recruiter notes about this specific candidate)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}`, {
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
      setSaveMsg('Note saved!');
      setTimeout(() => setSaveMsg(''), 1500);
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveMsg(`Failed to save note: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (showInterviewQuestions) {
    return <AIInterviewQuestions onBack={() => setShowInterviewQuestions(false)} jobDetails={resumeData.applicationDetails} resumeData={resumeData} />;
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-lg w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${resumeData.name}`} alt={resumeData.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200" />
          <div>
            <div className="text-3xl font-bold text-gray-900">{resumeData.name}</div>
            <p className="text-gray-600 text-lg">{resumeData.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {resumeData.status !== 'screening' && (
            <button 
              onClick={() => setShowInterviewQuestions(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18}/>
              Add Answer
            </button>
          )}
          {resumeData.status === 'screening' && !referredToManager && (
            <button
              onClick={async () => {
                try {
                  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                  const token = userInfo?.data?.accessToken;
                  if (!token) throw new Error('No authentication token found');
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ referredToManager: true })
                  });
                  if (!response.ok) throw new Error('Failed to refer to manager');
                  
                  // Update the state to trigger re-render
                  setReferredToManager(true);
                  
                  toast.success('Candidate referred to manager!');
                } catch (err) {
                  toast.error(err.message || 'Failed to refer to manager');
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              Refer to Manager
            </button>
          )}
        </div>
      </div>

      {/* Skills & Contact */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-y py-4 mb-8 gap-4">
        <div className="flex flex-wrap items-center gap-2">
            {resumeData.skills.slice(0, 4).map(skill => <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>)}
            {resumeData.skills.length > 4 && <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">+{resumeData.skills.length - 4}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2"><Mail size={16}/> {resumeData.email}</span>
            <span className="flex items-center gap-2"><Phone size={16}/> {resumeData.phone}</span>
            <span className="flex items-center gap-2"><Briefcase size={16}/> {resumeData.experience}</span>
            <span className="flex items-center gap-2"><MapPin size={16}/> {resumeData.location}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left & Middle Column */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* AI Summary & Scorecard */}
            <div className="p-6 border rounded-xl bg-gray-50">
                <div className="text-lg font-bold text-gray-800 mb-8">AI Resume Summary</div>
                <div className="space-y-8">
                    {Object.entries(resumeData.aiSummary).map(([key, value]) => (
                        <div key={key} className="flex gap-4 items-start">
                            <div className="bg-gray-200 rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1">
                                <HelpCircle size={18} className="text-gray-600" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 capitalize text-base mb-2">
                                    {key === 'skillMatch' ? 'Skill Match' : 
                                     key === 'competitiveFit' ? 'Competitive Fit & Market Prediction' : 
                                     key === 'consistencyCheck' ? 'Consistency Check' :
                                     key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <hr className="my-10 border-t border-gray-300" />
                
                <div className="text-lg font-bold text-gray-800 mb-8">AI Scorecard</div>
                <div className="space-y-6">
                    {Object.entries(resumeData.aiScorecard).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-gray-800 capitalize font-semibold text-base">
                                    {key === 'technicalSkillMatch' ? 'Technical Skill Match' : 
                                     key === 'competitiveFit' ? 'Competitive Fit & Market Prediction' : 
                                     key === 'consistencyCheck' ? 'Consistency Check' :
                                     key === 'teamLeadership' ? 'Team Leadership' :
                                     key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <span className="font-bold text-gray-900 text-base">{value}%</span>
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-3">
                                <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${value}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Application Details */}
            <div className="p-6 border rounded-xl bg-gray-50">
                <div className="text-xl font-bold text-gray-800 mb-4">Application Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-600 mt-4">
                    <div><span className="font-semibold text-gray-800 block mb-1">Position Applied</span><p>{resumeData.applicationDetails.position}</p></div>
                    <div><span className="font-semibold text-gray-800 block mb-1">Application Date</span><p>{resumeData.applicationDetails.date}</p></div>
                    <div><span className="font-semibold text-gray-800 block mb-1">Notice Period</span><p>{resumeData.applicationDetails.noticePeriod}</p></div>
                    <div><span className="font-semibold text-gray-800 block mb-1">Application Source</span><p>{resumeData.applicationDetails.source}</p></div>
                </div>
                <div className="mt-6">
                    <div className="font-semibold text-gray-800">About</div>
                    <p className="text-gray-600 mt-1">{resumeData.about}</p>
                </div>
                <div className="mt-6">
                    <div className="font-semibold text-gray-800">Key Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {resumeData.skills.map(skill => <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>)}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1">
          <div className="rounded-2xl border p-4 shadow bg-gray-50 flex flex-col">
            {/* Match Label */}
            <div className={`w-full text-lg font-semibold mb-2 ${match.color}`}>{match.label}</div>
            <div className="text-base font-bold text-black mb-2">Overall Score</div>
            {/* Small Graph */}
            <div className="relative my-2 flex justify-center">
              <svg className="w-36 h-36" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e6e6e6" strokeWidth="12" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="#2563eb" strokeWidth="12" strokeDasharray={`${(2 * Math.PI * 54 * resumeData.overallScore) / 100} 999`} transform="rotate(-90 60 60)" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-4xl font-light text-black">{resumeData.overallScore}%</span>
            </div>
            {/* Recommendation */}
            <div className="w-full text-center bg-blue-100 text-blue-900 font-medium rounded-xl py-2 px-3 mb-4">{resumeData.recommendation}</div>
            {/* Key Strength */}
            <div className="w-full mb-4 rounded-xl p-4 bg-green-50">
              <div className="font-semibold text-gray-800 mb-2">Key Strength</div>
              <ul className="list-disc pl-5 text-gray-800">
                {resumeData.keyStrength.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {/* Potential Concern */}
            <div className="w-full rounded-xl p-4 bg-red-50 mb-4">
              <div className="font-semibold text-gray-800 mb-2">Potential Concern</div>
              <ul className="list-disc pl-5 text-gray-800">
                {resumeData.potentialConcern.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {/* Added Notes */}
            <div className="w-full rounded-xl p-4 border border-gray-200">
              <div className="font-semibold text-gray-800 mb-2">Added Notes</div>
              <textarea
                className="w-full border-gray-200 rounded-lg p-2 text-sm"
                rows="4"
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={saving}
              ></textarea>
              <button
                className={`mt-2 w-full bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center ${saving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleSaveNote}
                disabled={saving}
              >
                {saving ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : null}
                {saving ? 'Saving...' : 'Add Note'}
              </button>
              {saveMsg && <div className="text-green-600 text-sm mt-2 text-center">{saveMsg}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Interview Transcript - Show only if evaluation exists and has results */}
      {resumeData.interviewEvaluation && 
       resumeData.interviewEvaluation.evaluationResults && 
       resumeData.interviewEvaluation.evaluationResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <InterviewTranscript interviewEvaluation={resumeData.interviewEvaluation} />
        </div>
      )}
    </div>
  );
};

export default ResumeDetailsView; 