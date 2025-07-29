import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Briefcase, Plus, CheckCircle, XCircle, HelpCircle, Circle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePDF } from 'react-to-pdf';

// Circular progress bar component
const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

const AccountManagerResumeDetailsView = ({ resume, onBack, onStatusUpdate }) => {
  const navigate = useNavigate();
  const pdfRef = useRef();
  const { toPDF, targetRef } = usePDF({filename: `${resume?.name || 'candidate'}-resume.pdf`});
  
  // Guard: If no _id, show error and redirect
  useEffect(() => {
    if (!resume || !resume._id) {
      // Redirect to job details after a short delay
      const timeout = setTimeout(() => {
        navigate(-1); // Go back one page
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [resume, navigate]);
  
  if (!resume || !resume._id) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: No resume ID found. Redirecting to job details...
      </div>
    );
  }

  // Debug logging
  console.log('AccountManagerResumeDetailsView - resume:', resume);
  console.log('AccountManagerResumeDetailsView - resume.addedNotes:', resume.addedNotes);
  
  const [note, setNote] = useState(resume.addedNotes || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(resume.status || 'submitted');

  // Helper to determine match label and color
  const getMatchLabel = (score) => {
    if (score >= 80) return { label: 'Strong Match', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { label: 'Good Match', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { label: 'Less Match', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const match = getMatchLabel(resume.overallScore);

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

      // Use the scorecard ID for API calls
      const resumeId = resume.scorecardId || resume._id;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/${resumeId}`, {
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
      
      setCurrentStatus('shortlisted');
      onStatusUpdate(resume._id, 'shortlisted');
      toast.success('Candidate shortlisted successfully!');
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
      toast.error(error.message || 'Failed to shortlist candidate');
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

      // Use the scorecard ID for API calls
      const resumeId = resume.scorecardId || resume._id;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/${resumeId}`, {
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
      
      setCurrentStatus('rejected');
      onStatusUpdate(resume._id, 'rejected');
      toast.success('Candidate rejected successfully!');
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      toast.error(error.message || 'Failed to reject candidate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      // Use the scorecard ID for API calls
      const resumeId = resume.scorecardId || resume._id;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/resumes/${resumeId}`, {
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
      
      setSaveMsg('Note saved!');
      setTimeout(() => setSaveMsg(''), 1500);
      toast.success('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-loading' });
      
      // Use browser print functionality directly (more reliable)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${resume.name || 'Candidate'} Resume Report</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6;
                  color: #333;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                  border-bottom: 2px solid #333; 
                  padding-bottom: 20px; 
                }
                .header h1 { 
                  font-size: 28px; 
                  margin-bottom: 10px; 
                  color: #000;
                }
                .header p { 
                  font-size: 14px; 
                  color: #666; 
                }
                .section { 
                  margin-bottom: 25px; 
                }
                .section h2 { 
                  font-size: 20px; 
                  margin-bottom: 10px; 
                  color: #000;
                  border-bottom: 1px solid #ccc; 
                  padding-bottom: 5px; 
                }
                .section h3 { 
                  font-size: 16px; 
                  margin-bottom: 8px; 
                  color: #000;
                  border-bottom: 1px solid #eee; 
                  padding-bottom: 3px; 
                }
                .grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 20px; 
                }
                .score { 
                  text-align: center; 
                  background: #f5f5f5; 
                  padding: 20px; 
                  border-radius: 8px; 
                  border: 1px solid #ddd;
                }
                .score h1 { 
                  font-size: 48px; 
                  color: #2563eb; 
                  margin: 10px 0; 
                }
                .skills { 
                  display: flex; 
                  flex-wrap: wrap; 
                  gap: 8px; 
                }
                .skill { 
                  background: #e0e0e0; 
                  padding: 4px 12px; 
                  border-radius: 12px; 
                  font-size: 12px; 
                  border: 1px solid #ccc;
                }
                .candidate-info {
                  display: flex;
                  align-items: center;
                  gap: 20px;
                  margin-bottom: 20px;
                }
                .avatar {
                  width: 80px;
                  height: 80px;
                  background: #ddd;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 24px;
                  font-weight: bold;
                  color: #666;
                  border: 2px solid #ccc;
                }
                .info p {
                  margin-bottom: 5px;
                }
                .info strong {
                  color: #000;
                }
                .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #ccc;
                }
                .footer p {
                  color: #666;
                  font-size: 12px;
                  margin-bottom: 5px;
                }
                @media print { 
                  body { margin: 15px; }
                  .section { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div>Candidate Resume Report</div>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="candidate-info">
                <div class="avatar">
                  ${resume.name ? resume.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A'}
                </div>
                <div class="info">
                  <div>${resume.name || 'Unknown'}</div>
                  <p><strong>Title:</strong> ${resume.title || 'N/A'}</p>
                  <p><strong>Email:</strong> ${resume.email || 'N/A'}</p>
                </div>
              </div>
              
              <div class="grid">
                <div class="section">
                  <div>Contact Information</div>
                  <p><strong>Email:</strong> ${resume.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> ${resume.phone || 'N/A'}</p>
                  <p><strong>Location:</strong> ${resume.location || 'N/A'}</p>
                  <p><strong>Experience:</strong> ${resume.experience || 'N/A'}</p>
                </div>
                <div class="section">
                  <div>Application Details</div>
                  <p><strong>Position:</strong> ${resume.applicationDetails?.position || 'N/A'}</p>
                  <p><strong>Applied Date:</strong> ${resume.applicationDetails?.date || 'N/A'}</p>
                  <p><strong>Notice Period:</strong> ${resume.applicationDetails?.noticePeriod || 'N/A'}</p>
                  <p><strong>Source:</strong> ${resume.applicationDetails?.source || 'N/A'}</p>
                </div>
              </div>
              
              <div class="section">
                <div class="score">
                  <div>Overall Assessment Score</div>
                  <div>${score}%</div>
                  <p>${match.label}</p>
                </div>
              </div>
              
              <div class="section">
                <div>Key Skills</div>
                <div class="skills">
                  ${resume.skills ? resume.skills.map(skill => `<span class="skill">${skill}</span>`).join('') : 'N/A'}
                </div>
              </div>
              
              ${resume.about ? `
              <div class="section">
                <div>About</div>
                <p>${resume.about}</p>
              </div>
              ` : ''}
              
              ${resume.aiSummary ? `
              <div class="section">
                <div>AI Analysis Summary</div>
                ${Object.entries(resume.aiSummary).map(([key, value]) => `
                  <div style="margin-bottom: 15px;">
                    <div style="font-size: 14px; margin-bottom: 5px; color: #000;">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <p style="color: #666;">${value}</p>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${resume.aiScorecard ? `
              <div class="section">
                <div >AI Scorecard</div>
                ${Object.entries(resume.aiScorecard).map(([key, value]) => `
                  <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                      <span style="font-size: 14px; color: #000;">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span style="font-weight: bold; color: #000;">${value}%</span>
                    </div>
                    <div style="width: 100%; background: #e0e0e0; height: 8px; border-radius: 4px;">
                      <div style="width: ${value}%; background: #2563eb; height: 8px; border-radius: 4px;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${resume.interviewEvaluation && resume.interviewEvaluation.evaluationResults && resume.interviewEvaluation.evaluationResults.length > 0 ? `
              <div class="section">
                <div>Interview Evaluation</div>
                ${resume.interviewEvaluation.evaluationResults.map((result, index) => `
                  <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 14px; margin-bottom: 8px; color: #000;">Q${index + 1}. ${result.question}</div>
                    <p style="color: #666; margin-bottom: 10px;">${result.reason}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                        ${result.confidence === 'High' ? 'background: #d4edda; color: #155724;' :
                          result.confidence === 'Medium' ? 'background: #fff3cd; color: #856404;' :
                          'background: #f8d7da; color: #721c24;'}">
                        ${result.confidence} Confidence
                      </span>
                      <span style="background: #333; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        Score: ${result.score}/10
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${resume.addedNotes ? `
              <div class="section">
                <div>Account Manager Notes</div>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                  <p style="color: #333;">${resume.addedNotes}</p>
                </div>
              </div>
              ` : ''}
              
              <div class="footer">
                <p>This report was generated automatically by ZEPUL</p>
                <p>Status: ${currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Submitted'}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Wait a bit for content to load, then print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast.success('PDF generated successfully!', { id: 'pdf-loading' });
        }, 500);
      } else {
        throw new Error('Could not open print window');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error.message}`, { id: 'pdf-loading' });
    }
  };

  // Get score for circular progress
  const score = resume.overallScore || resume.ats_score || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${resume.name}`} alt={resume.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200" />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{resume.name}</div>
              <p className="text-gray-600 text-base md:text-lg">{resume.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Show shortlist button only if status is screening */}
            {currentStatus === 'screening' && (
              <div
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
              </div>
            )}
            
            {/* Show reject button only if status is screening */}
            {currentStatus === 'screening' && (
              <div
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
              </div>
            )}
            
            {/* Show status indicator if already shortlisted or rejected */}
            {currentStatus === 'shortlisted' && (
              <>
                <div
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  Scorecard
                </div>
                <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle size={16} className="mr-2" />
                  Shortlisted
                </span>
              </>
            )}
            
            {currentStatus === 'rejected' && (
              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800">
                <XCircle size={16} className="mr-2" />
                Rejected
              </span>
            )}
            
            <div 
              onClick={onBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              Back to List
            </div>
          </div>
        </div>

        {/* Original Content - This remains visible on screen */}
        <div className="mt-8">
          {/* Skills & Contact */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-y py-4 mb-6 lg:mb-8 gap-4">
            <div className="flex flex-wrap items-center gap-2">
                {resume.skills && resume.skills.slice(0, 4).map(skill => <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>)}
                {resume.skills && resume.skills.length > 4 && <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">+{resume.skills.length - 4}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2"><Mail size={16}/> {resume.email}</span>
                <span className="flex items-center gap-2"><Phone size={16}/> {resume.phone}</span>
                <span className="flex items-center gap-2"><Briefcase size={16}/> {resume.experience}</span>
                <span className="flex items-center gap-2"><MapPin size={16}/> {resume.location}</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Left & Middle Column */}
            <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                {/* AI Summary & Scorecard */}
                <div className="p-6 border rounded-xl bg-gray-50">
                    <div className="text-lg font-bold text-black mb-8">AI Resume Summary</div>
                    <div className="space-y-8">
                        {resume.aiSummary && Object.entries(resume.aiSummary).map(([key, value]) => (
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

                    <hr className="my-10 border-t border-gray-300" />
                    
                    <div className="text-lg font-bold text-black mb-8">AI Scorecard</div>
                    <div className="space-y-6">
                        {resume.aiScorecard && Object.entries(resume.aiScorecard).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-gray-800 capitalize font-semibold text-base">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
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
                <div className="p-4 md:p-6 border rounded-xl bg-gray-50">
                    <div className="text-lg md:text-xl font-bold text-gray-800 mb-4">Application Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 text-gray-600 mt-4">
                        <div><span className="font-semibold text-gray-800 block mb-1 text-sm md:text-base">Position Applied</span><p className="text-sm md:text-base">{resume.applicationDetails?.position || 'N/A'}</p></div>
                        <div><span className="font-semibold text-gray-800 block mb-1 text-sm md:text-base">Application Date</span><p className="text-sm md:text-base">{resume.applicationDetails?.date || 'N/A'}</p></div>
                        <div><span className="font-semibold text-gray-800 block mb-1 text-sm md:text-base">Notice Period</span><p className="text-sm md:text-base">{resume.applicationDetails?.noticePeriod || 'N/A'}</p></div>
                        <div><span className="font-semibold text-gray-800 block mb-1 text-sm md:text-base">Application Source</span><p className="text-sm md:text-base">{resume.applicationDetails?.source || 'N/A'}</p></div>
                    </div>
                    <div className="mt-6">
                        <div className="font-semibold text-gray-800 text-sm md:text-base">About</div>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">{resume.about || 'No description available'}</p>
                    </div>
                    <div className="mt-6">
                        <div className="font-semibold text-gray-800 text-sm md:text-base">Key Skills</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {resume.skills && resume.skills.map(skill => <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>)}
                        </div>
                    </div>
                </div>

                {/* Interview Transcript Section - Only show if transcript data exists */}
                {resume.interviewEvaluation && resume.interviewEvaluation.evaluationResults && resume.interviewEvaluation.evaluationResults.length > 0 && (
                    <div className="p-4 md:p-6 border rounded-xl bg-gray-50">
                        <div className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Interview Transcript</div>
                        
                        <div className="space-y-4 md:space-y-6">
                            {resume.interviewEvaluation.evaluationResults.map((result, index) => (
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
                                        {/* Confidence Level
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getConfidenceColor(result.confidence)}`}>
                                            <Circle size={12} className={getConfidenceIconColor(result.confidence)} fill="currentColor" />
                                            <span className="text-sm font-medium">
                                                {result.confidence} Confidence
                                            </span>
                                        </div> */}

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

            {/* Right Column - Redesigned to match image */}
            <div className="xl:col-span-1">
                <div className="bg-gray-50 rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
                    {/* Overall Score Section */}
                    <div className="text-center">
                        <div className={`text-sm font-semibold ${match.color} mb-1`}>{match.label}</div>
                        <div className="text-lg font-bold text-gray-900 mb-4">Overall Score</div>
                        <div className="flex justify-center mb-4">
                            <CircularProgress percentage={score} size={120} strokeWidth={8} />
                        </div>
                        <div className="bg-blue-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                            Consider with caution
                        </div>
                    </div>

                    {/* Key Strength Section */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="font-bold text-gray-900 mb-3">Key Strength</div>
                        <ul className="space-y-2">
                            {resume.keyStrength && resume.keyStrength.length > 0 ? (
                                resume.keyStrength.map((strength, index) => (
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
                            {resume.potentialConcern && resume.potentialConcern.length > 0 ? (
                                resume.potentialConcern.map((concern, index) => (
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

                    {/* Added Notes Section */}
                    <div className="bg-white border rounded-lg p-4">
                        <div className="font-bold text-gray-900 mb-3">Added Notes</div>
                        <textarea
                            className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[100px] mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add your notes about this candidate..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            disabled={saving}
                        ></textarea>
                        <div
                            className={`w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleSaveNote}
                            disabled={saving}
                        >
                            {saving ? (
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                            ) : null}
                            {saving ? 'Saving...' : 'Add Note'}
                        </div>
                        {saveMsg && <div className="text-green-600 text-sm mt-2 text-center">{saveMsg}</div>}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagerResumeDetailsView; 