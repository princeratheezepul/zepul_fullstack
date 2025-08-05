import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Briefcase, Plus, CheckCircle, XCircle, HelpCircle, Circle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateScorecardPDF } from '../../../utils/pdfGenerator';

// Circular progress bar component - Fixed with proper circle rendering
const CircularProgress = ({ percentage, size = 160, strokeWidth = 14 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="absolute top-0 left-0"
        style={{ 
          transform: 'rotate(-90deg)',
          transformOrigin: 'center'
        }}
      >
        {/* Background circle - full ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e8e8e8"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          opacity="1"
        />
        {/* Progress circle - blue section */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          opacity="1"
          style={{ 
            transition: 'stroke-dashoffset 0.8s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span 
          className="font-bold text-gray-900" 
          style={{ 
            fontSize: '32px', 
            lineHeight: '1',
            textAlign: 'center'
          }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

const ResumeDetailsView = ({ resumeData, onBack }) => {
  const navigate = useNavigate();
  const pdfRef = useRef();
  const resumeContentRef = useRef();
  const [pdfLoading, setPdfLoading] = useState(false);
  
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

  // Debug logging
  console.log('ResumeDetailsView - jobDetails:', jobDetails);
  console.log('ResumeDetailsView - resumeData:', resumeData);
  console.log('ResumeDetailsView - resumeData.jobId:', resumeData.jobId);
  console.log('ResumeDetailsView - jobDetails?.internalNotes:', jobDetails?.internalNotes);
  console.log('ResumeDetailsView - resumeData.jobId?.internalNotes:', resumeData.jobId?.internalNotes);
  console.log('ResumeDetailsView - resumeData.addedNotes:', resumeData.addedNotes);
  
  const [note, setNote] = useState(
    resumeData.addedNotes || 
    jobDetails?.internalNotes || 
    ''
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(resumeData.status || 'submitted');

  // Helper to determine match label and color
  const getMatchLabel = (score) => {
    if (score >= 80) return { label: 'Strong Match', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { label: 'Good Match', color: 'text-green-500', bg: 'bg-green-50' };
    return { label: 'Less Match', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const match = getMatchLabel(resumeData.overallScore);

  // Helper functions for transcript confidence colors
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceIconColor = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle shortlist action
  const handleShortlist = async () => {
    setActionLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${resumeData._id}`, {
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
      
      // Update the local state
      setCurrentStatus('shortlisted');
      
      // Show success message
      toast.success('Candidate shortlisted successfully!');
    } catch (err) {
      console.error('Error shortlisting candidate:', err);
      toast.error(`Failed to shortlist candidate: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    setActionLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${resumeData._id}`, {
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
      
      // Update the local state
      setCurrentStatus('rejected');
      
      // Show success message
      toast.success('Candidate rejected successfully!');
    } catch (err) {
      console.error('Error rejecting candidate:', err);
      toast.error(`Failed to reject candidate: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

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

      // Always save to resume's addedNotes field (manager notes about this specific candidate)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${resumeData._id}`, {
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

  // Handle PDF download using global utility
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await generateScorecardPDF(resumeData, note);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  // Get score for circular progress
  const score = resumeData.overallScore || resumeData.ats_score || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Action Buttons Header */}
        <div className="flex justify-end mb-2">
          <div className="flex gap-2">
            {/* Show shortlist button only if status is screening */}
            {currentStatus === 'screening' && (
              <button
                onClick={handleShortlist}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {actionLoading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <CheckCircle size={16} />
                )}
                Shortlist
              </button>
            )}
            
            {/* Show reject button only if status is screening */}
            {currentStatus === 'screening' && (
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {actionLoading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <XCircle size={16} />
                )}
                Reject
              </button>
            )}
            
            {/* Show scorecard button for all candidates */}
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
              type="button"
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              Scorecard
            </button>
            
            {/* Show status indicators */}
            {currentStatus === 'shortlisted' && (
              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle size={16} className="mr-2" />
                Shortlisted
              </span>
            )}
            
            {currentStatus === 'rejected' && (
              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800">
                <XCircle size={16} className="mr-2" />
                Rejected
              </span>
            )}
            
            <button 
              onClick={onBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Original Content - This remains visible on screen */}
        {/* PDF EXPORT ROOT: Add inline style to force supported background color */}
        <div className="mt-1" ref={resumeContentRef} style={{ background: '#f9fafb' }}>
          {/* Header with Name, Title, Skills & Contact */}
          <div className="border-b border-gray-200 py-1 mb-2">
            {/* Top Row: Avatar, Name & Title - Centered */}
            <div className="flex flex-col items-center text-center gap-1 mb-0">
              <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${resumeData.name}`} alt={resumeData.name} className="w-20 h-20 rounded-full border-2 border-gray-200 bg-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{resumeData.name || 'Prince Rathi'}</div>
                <p className="text-gray-600 text-base">{resumeData.title || 'FullStack Developer'}</p>
              </div>
            </div>
            
            {/* Bottom Row: Skills & Contact */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Skills Section */}
              <div className="flex flex-wrap items-center gap-2">
                  {resumeData.skills && resumeData.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                  {resumeData.skills && resumeData.skills.length > 4 && (
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      +{resumeData.skills.length - 4}
                    </span>
                  )}
                  {/* Fallback skills if none provided */}
                  {(!resumeData.skills || resumeData.skills.length === 0) && (
                    <>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">JavaScript</span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">TypeScript</span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">React.js</span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Node.js</span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">+6</span>
                    </>
                  )}
              </div>
              
              {/* Contact Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Mail size={16}/> 
                    {resumeData.email || 'rathi.prince2@gmail.com'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone size={16}/> 
                    {resumeData.phone || '9690389156'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Briefcase size={16}/> 
                    {resumeData.experience || 'Less than 1 year'}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={16}/> 
                    {resumeData.location || 'Himachal Pradesh, India'}
                  </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Left & Middle Column */}
            <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                {/* AI Resume Summary */}
                <div className="p-6 border rounded-xl bg-gray-50">
                    <div className="text-sm font-semibold text-black mb-4">AI Resume Summary</div>
                    <div className="space-y-8">
                        {resumeData.aiSummary && Object.entries(resumeData.aiSummary).map(([key, value]) => (
                            <div key={key} className="flex gap-4 items-start">
                                <div className="bg-gray-200 rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1">
                                    <HelpCircle size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 capitalize text-base mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Scorecard - Separate Container */}
                <div className=" p-6 border rounded-xl bg-gray-50">
                    <div className="text-lg font-bold text-black mb-8">AI Scorecard</div>
                    <div className="space-y-6">
                        {resumeData.aiScorecard && Object.keys(resumeData.aiScorecard).length > 0 ? 
                            Object.entries(resumeData.aiScorecard).map(([key, value]) => {
                                const numericValue = parseInt(value) || 0;
                                const displayName = key === 'technicalSkillMatch' ? 'Technical Skill Match' :
                                                  key === 'cultureFit' ? 'Culture Fit' :
                                                  key === 'teamLeadership' ? 'Team Leadership' :
                                                  key.charAt(0).toUpperCase() + key.slice(1);
                                
                                return (
                                    <div key={key} className="scorecard-item">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-gray-800 font-semibold text-base">{displayName}</div>
                                            <span className="font-bold text-gray-900 text-base">{numericValue}%</span>
                                        </div>
                                        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                                                style={{ 
                                                    width: `${Math.min(Math.max(numericValue, 0), 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            }) : (
                            // Fallback with sample data if no aiScorecard
                            <div className="space-y-6">
                                <div className="scorecard-item">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-gray-800 font-semibold text-base">Technical Skill Match</div>
                                        <span className="font-bold text-gray-900 text-base">85%</span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                        <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                                <div className="scorecard-item">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-gray-800 font-semibold text-base">Communication</div>
                                        <span className="font-bold text-gray-900 text-base">78%</span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                        <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                                <div className="scorecard-item">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-gray-800 font-semibold text-base">Culture Fit</div>
                                        <span className="font-bold text-gray-900 text-base">72%</span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                        <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '72%' }}></div>
                                    </div>
                                </div>
                                <div className="scorecard-item">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-gray-800 font-semibold text-base">Team Leadership</div>
                                        <span className="font-bold text-gray-900 text-base">65%</span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                        <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


            </div>

            {/* Right Column - Redesigned to match image */}
            <div className="xl:col-span-1">
                <div className="bg-gray-50 rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
                    {/* Overall Score Section - Match Reference Image */}
                    <div className="text-center py-8">
                        <div className={`${match.color} text-sm font-semibold mb-3`}>{match.label}</div>
                        <div className="text-xl font-bold text-gray-900 mb-8">Overall Score</div>
                        <div className="flex justify-center mb-8">
                            <CircularProgress percentage={score} size={160} strokeWidth={14} />
                        </div>
                        <button className="bg-blue-100 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium border border-gray-300 hover:bg-blue-200 transition-colors">
                            Consider with caution
                        </button>
                    </div>

                    {/* Key Strength Section */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="font-bold text-gray-900 mb-3">Key Strength</div>
                        <ul className="space-y-2">
                            {resumeData.keyStrength && resumeData.keyStrength.length > 0 ? (
                                resumeData.keyStrength.map((strength, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-green-600 mt-1">•</span>
                                        <span>{strength}</span>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-green-600 mt-1">•</span>
                                        <span>Strong technical skills and relevant experience</span>
                                    </li>
                                    <li className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-green-600 mt-1">•</span>
                                        <span>Good communication and teamwork abilities</span>
                                    </li>
                                    <li className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-green-600 mt-1">•</span>
                                        <span>Demonstrated problem-solving capabilities</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Potential Concern Section */}
                    <div className="bg-red-50 rounded-lg p-4">
                        <div className="font-bold text-gray-900 mb-3">Potential Concern</div>
                        <ul className="space-y-2">
                            {resumeData.potentialConcern && resumeData.potentialConcern.length > 0 ? (
                                resumeData.potentialConcern.map((concern, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-red-600 mt-1">•</span>
                                        <span>{concern}</span>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-red-600 mt-1">•</span>
                                        <span>Limited professional experience in the field</span>
                                    </li>
                                    <li className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-red-600 mt-1">•</span>
                                        <span>Resume formatting could be improved</span>
                                    </li>
                                    <li className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-red-600 mt-1">•</span>
                                        <span>Some skill gaps identified</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                    {/* Added Notes Section - Enhanced Design - Show always on screen, conditionally in PDF */}
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 added-notes-section ${note && note.trim() ? 'has-content' : 'no-content'}`}>
                        <div className="text-lg font-bold text-gray-900 mb-4">Added Notes</div>
                        <div className="mb-6">
                            <textarea
                                className="w-full border-0 bg-transparent text-gray-700 text-sm leading-relaxed min-h-[120px] resize-none focus:outline-none placeholder-gray-400"
                                placeholder="Experience Senior Software engineer with over 5+ years of experience in designing ad implementing scalable backend system Specialized in java,spring boot,and microservices architecture.Passionate about clean code, performance, optimization and mentoring junior developers"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                disabled={saving}
                                style={{ 
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    lineHeight: '1.6'
                                }}
                            ></textarea>
                        </div>
                        {/* Hidden content for PDF - only shows if note has actual content */}
                        {note && note.trim() && (
                            <div className="pdf-only-notes" style={{ display: 'none' }}>
                                <div className="text-lg font-bold text-gray-900 mb-4">Added Notes</div>
                                <div className="text-gray-700 text-sm leading-relaxed">
                                    {note}
                                </div>
                            </div>
                        )}
                        <button
                            className={`bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center cursor-pointer text-sm no-print ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleSaveNote}
                            disabled={saving}
                            style={{ minWidth: '120px' }}
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Add Note'
                            )}
                        </button>
                        {saveMsg && <div className="text-green-600 text-sm mt-3 font-medium no-print">{saveMsg}</div>}
                    </div>
                </div>
            </div>
          </div>

          {/* Application Details - Enhanced Design - Outside Grid but Inside PDF Scope */}
      <div className="w-[80vw] mx-auto mt-8 p-4 md:p-6 border rounded-xl bg-gray-50">
        <div className="text-xl font-bold text-gray-900 mb-6">Application Details</div>
        
        {/* Application Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
          <div className="application-detail-item">
            <span className="block text-sm font-semibold text-gray-700">Position Applied</span>
            <p className="text-base text-gray-900 font-medium">{resumeData.applicationDetails?.position || 'Test Job'}</p>
        </div>
          <div className="application-detail-item">
            <span className="block text-sm font-semibold text-gray-700">Application Date</span>
            <p className="text-base text-gray-900 font-medium">{resumeData.applicationDetails?.date || '7/21/2025'}</p>
          </div>
          <div className="application-detail-item">
            <span className="block text-sm font-semibold text-gray-700">Notice Period</span>
            <p className="text-base text-gray-900 font-medium">{resumeData.applicationDetails?.noticePeriod || 'N/A'}</p>
          </div>
          <div className="application-detail-item">
            <span className="block text-sm font-semibold text-gray-700">Application Source</span>
            <p className="text-base text-gray-900 font-medium">{resumeData.applicationDetails?.source || 'Website'}</p>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <div className="text-lg font-semibold text-gray-900 mb-3">About</div>
          <p className="text-base text-gray-700 leading-relaxed">
            {resumeData.about || 'Prince Rathi is a FullStack + Devops Developer with experience in building and deploying various projects. He has won several hackathons and showcases skills in various programming languages and frameworks.'}
          </p>
        </div>

        {/* Key Skills Section */}
        <div>
          <div className="text-lg font-semibold text-gray-900 mb-4">Key Skills</div>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills && resumeData.skills.length > 0 ? 
              resumeData.skills.map(skill => (
                <span key={skill} className="skill-tag-refined bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
                  {skill}
                </span>
              )) : (
              // Fallback skills if none provided - matching reference order
              ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'MongoDB', 'Solidity', 'Express.js', 'Redux', 'Git', 'Hardhat'].map(skill => (
                <span key={skill} className="skill-tag-refined bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interview Transcript Section - Only show if transcript data exists - Outside Grid */}
      {resumeData.interviewEvaluation && resumeData.interviewEvaluation.evaluationResults && resumeData.interviewEvaluation.evaluationResults.length > 0 && (
        <div className="w-[80vw] mx-auto p-4 md:p-6 border rounded-xl bg-gray-50">
          <div className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Interview Transcript</div>
          
          <div className="space-y-4 md:space-y-6">
            {resumeData.interviewEvaluation.evaluationResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 md:p-6">
                {/* Question */}
                <div className="mb-3 md:mb-4">
                  <div className="font-light text-gray-900 text-base md:text-lg">
                    Q{index + 1}. {result.question}
                  </div>
                </div>

                {/* Evaluation Summary */}
                <div className="mb-4 md:mb-6">
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {result.reason}
                  </p>
                </div>

                {/* Bottom Row - Confidence and Score */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {/* Confidence Level */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getConfidenceColor(result.confidence)}`}>
                    <Circle size={12} className={getConfidenceIconColor(result.confidence)} fill="currentColor" />
                    <span className="text-sm font-medium">
                      {result.confidence} Confidence
                    </span>
                  </div>

                  {/* Score */}
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-full">
                    <span className="text-sm font-medium">
                      Score: {result.score}/10
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDetailsView; 