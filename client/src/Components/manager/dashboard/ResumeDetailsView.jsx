import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Briefcase, Plus, CheckCircle, XCircle, HelpCircle, Circle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePDF } from 'react-to-pdf';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const { toPDF, targetRef } = usePDF({filename: `${resumeData?.name || 'candidate'}-resume.pdf`});
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
    if (score >= 60) return { label: 'Good Match', color: 'text-orange-500', bg: 'bg-orange-50' };
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

  // Handle PDF download - simple browser print approach
  const handleDownloadPDF = async () => {
    if (!resumeContentRef.current) return;
    setPdfLoading(true);
    
    try {
      // Use browser's print functionality which handles modern CSS better
      const printContent = resumeContentRef.current.innerHTML;
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resumeData.name || 'Candidate'} Scorecard</title>
            <meta charset="utf-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: #f8fafc;
                padding: 0;
                margin: 0;
                font-size: 14px;
              }
              
              /* Main container */
              .scorecard-wrapper {
                background: #f8fafc;
                min-height: 100vh;
                padding: 24px;
              }
               
               /* Modern Professional Scorecard Design */
               
               /* Background and Layout */
               .bg-gray-50 { background-color: #f8fafc !important; }
               .bg-white { 
                 background-color: #ffffff !important; 
                 border-radius: 16px !important;
                 box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                 margin-bottom: 24px !important;
                 padding: 24px !important;
                 border: 1px solid #e2e8f0 !important;
               }
               
                               /* Enhanced Header with Name, Title, Skills & Contact */
                .border-y.border-gray-200 {
                  background: #ffffff !important;
                  border-top: 1px solid #e5e7eb !important;
                  border-bottom: 1px solid #e5e7eb !important;
                  padding: 12px 0 !important;
                  margin-bottom: 8px !important;
                }
               
                               /* Header top row styling - Centered */
                .flex.flex-col.items-center.text-center.gap-2.mb-3 {
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                  text-align: center !important;
                  gap: 8px !important;
                  margin-bottom: 12px !important;
                }
               
                               /* Avatar in header - Centered and larger */
                .w-20.h-20.rounded-full.border-2.border-gray-200.bg-green-600 {
                  width: 80px !important;
                  height: 80px !important;
                  border-radius: 50% !important;
                  border: 2px solid #e5e7eb !important;
                  background: #10b981 !important;
                }
               
                               /* Name and title in header - Centered */
                .text-2xl.font-bold.text-gray-900 {
                  font-size: 24px !important;
                  font-weight: 700 !important;
                  color: #111827 !important;
                  margin: 0 !important;
                  text-align: center !important;
                }
               
               /* Skills and contact row */
               .flex.flex-col.lg\\:flex-row.items-start.lg\\:items-center.justify-between.gap-4 {
                 display: flex !important;
                 align-items: center !important;
                 justify-content: space-between !important;
                 gap: 16px !important;
               }
               
               /* Hide buttons in PDF */
               .no-print,
               button,
               .bg-blue-600,
               .bg-green-600,
               .bg-gray-600,
               [class*="bg-blue-"],
               [class*="bg-green-"][class*="Shortlisted"],
               [class*="bg-gray-"][class*="Back"] {
                 display: none !important;
               }
               
               /* Hide specific button text content */
               span:contains("Scorecard"),
               span:contains("Shortlisted"),
               span:contains("Back to List"),
               div:contains("Scorecard"),
               div:contains("Shortlisted"),
               div:contains("Back to List") {
                 display: none !important;
               }
               
                               /* Header subtitle styling - Centered */
                .text-gray-600.text-base {
                  color: #6b7280 !important;
                  font-size: 16px !important;
                  font-weight: 400 !important;
                  margin: 0 !important;
                  text-align: center !important;
                }
               
               /* Skills container in header */
               .flex.flex-wrap.items-center.gap-2 {
                 display: flex !important;
                 flex-wrap: wrap !important;
                 align-items: center !important;
                 gap: 8px !important;
               }
               
               /* Contact items in header */
               .flex.flex-wrap.items-center.gap-4 {
                 display: flex !important;
                 flex-wrap: wrap !important;
                 align-items: center !important;
                 gap: 16px !important;
               }
               
               /* Skills horizontal layout */
               .flex.flex-wrap.items-center.gap-2 {
                 display: flex !important;
                 flex-wrap: wrap !important;
                 align-items: center !important;
                 gap: 8px !important;
                 margin-right: 24px !important;
               }
               
               /* Contact Info - Single Horizontal Row */
               .flex.flex-wrap.items-center.gap-4 {
                 display: flex !important;
                 flex-wrap: wrap !important;
                 align-items: center !important;
                 gap: 24px !important;
                 margin-top: 0 !important;
               }
               
               /* Contact Items - Clean and Simple */
               .flex.flex-wrap.items-center.gap-4 span {
                 display: flex !important;
                 align-items: center !important;
                 background: transparent !important;
                 color: #6b7280 !important;
                 padding: 0 !important;
                 border-radius: 0 !important;
                 font-size: 14px !important;
                 font-weight: 400 !important;
                 border: none !important;
                 gap: 6px !important;
               }
               
               /* Small Icons for Contact */
               .flex.flex-wrap.items-center.gap-4 span svg,
               .flex.flex-wrap.items-center.gap-4 span .lucide {
                 width: 16px !important;
                 height: 16px !important;
                 color: #6b7280 !important;
               }
               
               /* Skill tags in header */
               .bg-gray-100.text-gray-800.px-3.py-1.rounded-full.text-sm.font-medium {
                 background-color: #f3f4f6 !important;
                 color: #374151 !important;
                 padding: 4px 12px !important;
                 border-radius: 9999px !important;
                 font-size: 14px !important;
                 font-weight: 500 !important;
               }
               
               .bg-gray-200.text-gray-700.px-3.py-1.rounded-full.text-sm.font-medium {
                 background-color: #e5e7eb !important;
                 color: #374151 !important;
                 padding: 4px 12px !important;
                 border-radius: 9999px !important;
                 font-size: 14px !important;
                 font-weight: 500 !important;
               }
               
               /* Profile Avatar - Match Reference */
               img[src*="dicebear"] {
                 width: 60px !important;
                 height: 60px !important;
                 border-radius: 50% !important;
                 border: 2px solid #e5e7eb !important;
                 background: #10b981 !important;
               }
               
               /* Name and Title Styling */
               .flex.items-center.gap-4 div,
               .flex.items-center.gap-6 div {
                 font-size: 24px !important;
                 font-weight: 700 !important;
                 color: #1f2937 !important;
                 margin: 0 !important;
               }
               
               .flex.items-center.gap-4 p,
               .flex.items-center.gap-6 p {
                 font-size: 16px !important;
                 font-weight: 400 !important;
                 color: #6b7280 !important;
                 margin: 0 !important;
               }
               
               /* Color Palette */
               .bg-gray-100 { background-color: #f1f5f9 !important; border-radius: 12px !important; }
               .bg-gray-200 { background-color: #e2e8f0 !important; }
               .bg-gray-800 { background-color: #1e293b !important; }
               .bg-gray-900 { background-color: #0f172a !important; }
               .bg-blue-100 { background-color: #dbeafe !important; border-radius: 12px !important; }
               .bg-blue-500 { background-color: #3b82f6 !important; }
               .bg-blue-600 { background-color: #2563eb !important; }
               .bg-green-50 { 
                 background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%) !important; 
                 border: 2px solid #bbf7d0 !important;
                 border-radius: 16px !important;
                 padding: 20px !important;
               }
               .bg-green-100 { background-color: #dcfce7 !important; }
               .bg-red-50 { 
                 background: linear-gradient(135deg, #fef2f2 0%, #fef1f1 100%) !important; 
                 border: 2px solid #fecaca !important;
                 border-radius: 16px !important;
                 padding: 20px !important;
               }
               .bg-red-100 { background-color: #fee2e2 !important; }
               
               /* Typography */
               .text-gray-500 { color: #64748b !important; }
               .text-gray-600 { color: #475569 !important; }
               .text-gray-700 { color: #334155 !important; }
               .text-gray-800 { color: #1e293b !important; }
               .text-gray-900 { color: #0f172a !important; }
               .text-blue-600 { color: #2563eb !important; }
               .text-green-600 { color: #059669 !important; }
               .text-green-700 { color: #047857 !important; }
               .text-red-600 { color: #dc2626 !important; }
               .text-red-700 { color: #b91c1c !important; }
               .text-white { color: #ffffff !important; }
               
               /* Font Sizes */
               .text-sm { font-size: 14px !important; line-height: 20px !important; }
               .text-base { font-size: 16px !important; line-height: 24px !important; }
               .text-lg { font-size: 18px !important; line-height: 28px !important; }
               .text-xl { font-size: 20px !important; line-height: 28px !important; }
               .text-2xl { font-size: 24px !important; line-height: 32px !important; }
               .text-5xl { font-size: 48px !important; line-height: 1 !important; }
               .font-medium { font-weight: 500 !important; }
               .font-semibold { font-weight: 600 !important; }
               .font-bold { font-weight: 700 !important; }
               
               .border { border: 1px solid #e5e7eb !important; }
               .border-gray-100 { border-color: #f3f4f6 !important; }
               .border-gray-200 { border-color: #e5e7eb !important; }
               .border-green-200 { border-color: #bbf7d0 !important; }
               .border-red-200 { border-color: #fecaca !important; }
               .border-yellow-200 { border-color: #fde68a !important; }
               .border-y { border-top: 1px solid #e5e7eb !important; border-bottom: 1px solid #e5e7eb !important; }
               
               .rounded-xl { border-radius: 0.75rem !important; }
               .rounded-lg { border-radius: 0.5rem !important; }
               .rounded-full { border-radius: 9999px !important; }
               .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
               
               .p-4 { padding: 1rem !important; }
               .p-6 { padding: 1.5rem !important; }
               .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
               .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
               .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
               .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
               .mb-1 { margin-bottom: 0.25rem !important; }
               .mb-2 { margin-bottom: 0.5rem !important; }
               .mb-3 { margin-bottom: 0.75rem !important; }
               .mb-4 { margin-bottom: 1rem !important; }
               .mb-6 { margin-bottom: 1.5rem !important; }
               .mt-1 { margin-top: 0.25rem !important; }
               .mt-2 { margin-top: 0.5rem !important; }
               .mt-4 { margin-top: 1rem !important; }
               .mt-6 { margin-top: 1.5rem !important; }
               .mt-8 { margin-top: 2rem !important; }
               .gap-2 { gap: 0.5rem !important; }
               .gap-3 { gap: 0.75rem !important; }
               .gap-4 { gap: 1rem !important; }
               .gap-6 { gap: 1.5rem !important; }
               .gap-8 { gap: 2rem !important; }
               
               .flex { display: flex !important; }
               .grid { display: grid !important; }
               .flex-col { flex-direction: column !important; }
               .flex-wrap { flex-wrap: wrap !important; }
               .items-start { align-items: flex-start !important; }
               .items-center { align-items: center !important; }
               .justify-between { justify-content: space-between !important; }
               .justify-center { justify-content: center !important; }
               .text-center { text-align: center !important; }
               .space-y-2 > * + * { margin-top: 0.5rem !important; }
               .space-y-4 > * + * { margin-top: 1rem !important; }
               .space-y-5 > * + * { margin-top: 1.25rem !important; }
               .space-y-6 > * + * { margin-top: 1.5rem !important; }
               
               /* Critical: Maintain grid layout */
               .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
               .xl\\:grid-cols-3 { 
                 grid-template-columns: 2fr 1fr !important; 
                 gap: 1.5rem !important;
               }
               .xl\\:col-span-2 { grid-column: 1 / 2 !important; }
               .xl\\:col-span-1 { 
                 grid-column: 2 / 3 !important; 
                 min-width: 280px !important;
               }
               
               /* Skill Tags Styling */
               .bg-gray-100.text-gray-800 {
                 background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
                 color: #1e293b !important;
                 padding: 8px 16px !important;
                 border-radius: 20px !important;
                 font-size: 14px !important;
                 font-weight: 500 !important;
                 display: inline-block !important;
                 margin: 4px !important;
                 border: 1px solid #cbd5e1 !important;
                 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
               }
               
               /* Enhanced Progress Bars for AI Scorecard */
               .scorecard-item .bg-gray-200 {
                 background-color: #e5e7eb !important;
                 height: 8px !important;
                 border-radius: 8px !important;
                 overflow: hidden !important;
               }
               
               .scorecard-item .bg-blue-600 {
                 background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%) !important;
                 height: 8px !important;
                 border-radius: 8px !important;
                 transition: width 0.5s ease-out !important;
                 box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3) !important;
               }
               
               /* Scorecard item styling */
               .scorecard-item {
                 padding: 12px 0 !important;
                 border-bottom: 1px solid #f3f4f6 !important;
               }
               
               .scorecard-item:last-child {
                 border-bottom: none !important;
               }
               
               /* Fixed Circular Progress - Proper Circle Rendering */
               .relative.flex.items-center.justify-center {
                 width: 160px !important;
                 height: 160px !important;
                 margin: 0 auto !important;
                 position: relative !important;
               }
               
               svg.absolute.top-0.left-0 {
                 width: 160px !important;
                 height: 160px !important;
                 position: absolute !important;
                 top: 0 !important;
                 left: 0 !important;
                 transform: rotate(-90deg) !important;
                 transform-origin: center !important;
               }
               
               /* Circular Progress Circle Styling */
               svg circle {
                 stroke-linecap: round !important;
               }
               
               /* Progress circle - Clean blue with full thickness */
               svg circle[stroke="#3b82f6"] {
                 stroke: #3b82f6 !important;
                 stroke-width: 14px !important;
                 fill: none !important;
               }
               
               /* Background circle - Light gray full ring */
               svg circle[stroke="#e8e8e8"] {
                 stroke: #e8e8e8 !important;
                 stroke-width: 14px !important;
                 fill: none !important;
               }
               
               /* Score text in circle - Perfectly centered */
               .absolute.inset-0.flex.items-center.justify-center.z-10 span {
                 font-size: 32px !important;
                 font-weight: 700 !important;
                 color: #1f2937 !important;
                 line-height: 1 !important;
                 text-align: center !important;
               }
               
               /* Fallback SVG styling to ensure circles render */
               svg {
                 display: block !important;
                 opacity: 1 !important;
                 visibility: visible !important;
               }
               
               svg circle {
                 vector-effect: non-scaling-stroke !important;
                 opacity: 1 !important;
                 visibility: visible !important;
               }
               
               /* Force visibility for specific colors */
               svg circle[stroke="#e8e8e8"] {
                 stroke: #e8e8e8 !important;
                 opacity: 1 !important;
               }
               
               svg circle[stroke="#3b82f6"] {
                 stroke: #3b82f6 !important;
                 opacity: 1 !important;
               }
               
               /* Overall Score Section - Clean card */
               .xl\\:col-span-1 > div {
                 background: #ffffff !important;
                 border: 1px solid #e5e7eb !important;
                 border-radius: 12px !important;
                 padding: 24px !important;
                 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
               }
               
               /* Score section styling - match reference spacing */
               .text-center.py-8 {
                 padding: 40px 20px !important;
               }
               
               /* Enhanced Added Notes Section */
               .bg-white.rounded-xl.shadow-sm.border.border-gray-200.p-6 {
                 background: #ffffff !important;
                 border: 1px solid #e5e7eb !important;
                 border-radius: 12px !important;
                 padding: 24px !important;
                 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
               }
               
               /* Added Notes textarea styling */
               textarea.border-0.bg-transparent {
                 background: transparent !important;
                 border: none !important;
                 color: #374151 !important;
                 font-size: 14px !important;
                 line-height: 1.6 !important;
                 min-height: 120px !important;
               }
               
               /* Add Note button styling */
               .bg-gray-900.text-white {
                 background-color: #111827 !important;
                 color: #ffffff !important;
                 padding: 12px 24px !important;
                 border-radius: 8px !important;
                 font-size: 14px !important;
                 font-weight: 500 !important;
                 min-width: 120px !important;
               }
               
               /* Enhanced Application Details Section */
               .application-detail-item {
                 padding-bottom: 8px !important;
               }
               
               .application-detail-item span {
                 color: #374151 !important;
                 font-size: 14px !important;
                 font-weight: 600 !important;
                 margin-bottom: 1px !important;
               }
               
               .application-detail-item p {
                 color: #111827 !important;
                 font-size: 16px !important;
                 font-weight: 500 !important;
                 margin: 0 !important;
               }
               
               /* Refined skill tags - match reference design */
               .skill-tag-refined {
                 background-color: #f9fafb !important;
                 color: #374151 !important;
                 padding: 8px 12px !important;
                 border-radius: 6px !important;
                 font-size: 14px !important;
                 font-weight: 500 !important;
                 border: 1px solid #e5e7eb !important;
                 transition: all 0.2s ease !important;
                 display: inline-block !important;
                 line-height: 1.2 !important;
               }
               
               .skill-tag-refined:hover {
                 background-color: #f3f4f6 !important;
               }
               
               /* Legacy skill tag support */
               .skill-tag {
                 background-color: #f3f4f6 !important;
                 color: #374151 !important;
                 padding: 8px 16px !important;
                 border-radius: 8px !important;
                 font-size: 14px !important;
                 font-weight: 500 !important;
                 border: 1px solid #e5e7eb !important;
                 transition: all 0.2s ease !important;
               }
               
               .skill-tag:hover {
                 background-color: #e5e7eb !important;
               }
               
               /* Section titles in Application Details */
               div.text-xl.font-bold.text-gray-900 {
                 color: #111827 !important;
                 font-size: 20px !important;
                 font-weight: 700 !important;
                 margin-bottom: 24px !important;
               }
               
               div.text-lg.font-semibold.text-gray-900 {
                 color: #111827 !important;
                 font-size: 18px !important;
                 font-weight: 600 !important;
                 margin-bottom: 12px !important;
               }
               
               /* About text styling */
               .text-base.text-gray-700.leading-relaxed {
                 color: #374151 !important;
                 font-size: 16px !important;
                 line-height: 1.6 !important;
               }
               
               /* Key Skills container spacing */
               .flex.flex-wrap.gap-2 {
                 gap: 8px !important;
                 line-height: 1.4 !important;
               }
               
               /* Match label styling */
               .text-orange-500 {
                 color: #f97316 !important;
                 font-size: 14px !important;
                 font-weight: 600 !important;
               }
               
               /* Overall Score title */
               .text-xl.font-bold.text-gray-900 {
                 font-size: 20px !important;
                 font-weight: 700 !important;
                 color: #1f2937 !important;
               }
               
               /* Consider button styling - match reference */
               .bg-blue-100.text-gray-700 {
                 background-color: #dbeafe !important;
                 color: #374151 !important;
                 border: 1px solid #93c5fd !important;
                 border-radius: 8px !important;
                 padding: 12px 24px !important;
                 font-size: 14px !important;
                 font-weight: 500 !important;
               }
               
               /* Hide question mark icons and improve layout */
               .bg-gray-100.rounded-full.w-6.h-6,
               .bg-gray-100.rounded-full.w-7.h-7 {
                 display: none !important;
               }
               
               /* Improve AI Summary section layout */
               .flex.gap-3.items-start,
               .flex.gap-4.items-start {
                 display: block !important;
                 margin-bottom: 20px !important;
               }
               
               /* Section Headers */
               div, div, div {
                 font-weight: 700 !important;
                 color: #0f172a !important;
                 margin-bottom: 16px !important;
               }
               
               div { font-size: 28px !important; }
               div { font-size: 20px !important; }
               div { font-size: 16px !important; }
               
               /* Progress Bar Container Styling */
               .w-full.bg-gray-200.rounded-full.h-1\\.5 {
                 background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%) !important;
                 height: 8px !important;
                 border-radius: 12px !important;
                 box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
               }
               
               /* Enhanced Progress Bars */
               .bg-blue-600.h-1\\.5.rounded-full {
                 background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%) !important;
                 height: 8px !important;
                 border-radius: 12px !important;
                 box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4) !important;
               }
               
               /* Special Elements */
               hr {
                 border: none !important;
                 border-top: 2px solid #e2e8f0 !important;
                 margin: 24px 0 !important;
                 opacity: 0.6 !important;
               }
              
                             /* Skills - Match Reference Image Style */
               .flex.flex-wrap.items-center.gap-2 span {
                 background: #f3f4f6 !important;
                 color: #374151 !important;
                 padding: 6px 12px !important;
                 border-radius: 16px !important;
                 font-size: 13px !important;
                 font-weight: 500 !important;
                 border: 1px solid #e5e7eb !important;
                 margin: 2px !important;
                 box-shadow: none !important;
               }
               
               /* All icons in the document - ensure they're appropriately sized */
               svg:not([class*="progress"]):not([width="120"]):not([width="140"]) {
                 width: 18px !important;
                 height: 18px !important;
               }
               
               /* Specifically target Lucide icons */
               .lucide {
                 width: 18px !important;
                 height: 18px !important;
               }
               
               /* Match Label Styling */
               .text-orange-500 { color: #f97316 !important; font-weight: 600 !important; }
               .text-green-600 { color: #059669 !important; font-weight: 600 !important; }
               .text-red-600 { color: #dc2626 !important; font-weight: 600 !important; }
               
               /* Print specific styles */
               @media print {
                 body { 
                   background: white !important; 
                   margin: 0 !important;
                   padding: 0.3in !important;
                   font-size: 12px !important;
                 }
                 
                 * { 
                   print-color-adjust: exact !important; 
                   -webkit-print-color-adjust: exact !important;
                 }
                 
                 .scorecard-wrapper { background: white !important; padding: 0 !important; }
                 .bg-gray-50 { background: white !important; }
                 
                 /* Maintain card styling in print - Allow page breaks */
                 .bg-white {
                   background-color: #ffffff !important; 
                   border: 1px solid #cbd5e1 !important;
                   border-radius: 12px !important;
                   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                   margin-bottom: 16px !important;
                   padding: 20px !important;
                   page-break-inside: auto !important;
                   break-inside: auto !important;
                 }
                 
                 /* Ensure natural page flow for main content */
                 .grid.grid-cols-1.xl\\:grid-cols-3 {
                   page-break-inside: auto !important;
                   break-inside: auto !important;
                 }
                 
                 /* Allow AI Resume Summary to flow naturally */
                 .xl\\:col-span-2 {
                   page-break-inside: auto !important;
                   break-inside: auto !important;
                 }
                 
                 /* Allow content within cards to break across pages */
                 .space-y-4,
                 .space-y-6 {
                   page-break-inside: auto !important;
                   break-inside: auto !important;
                 }
                 
                 /* Individual AI summary items can break naturally */
                 .flex.gap-3,
                 .flex.gap-4 {
                   page-break-inside: auto !important;
                   break-inside: auto !important;
                 }
                 
                 /* Clean page break rules - only one break per section */
                 .ai-scorecard-section {
                   page-break-before: always !important;
                   break-before: page !important;
                 }
                 
                 .added-notes-section {
                   page-break-before: always !important;
                   break-before: page !important;
                 }
                 
                 /* Keep AI Scorecard content together */
                 .ai-scorecard-section + div {
                   page-break-before: avoid !important;
                   break-before: avoid !important;
                 }
                 
                 /* Ensure AI Resume Summary stays together on first page */
                 div:contains("AI Resume Summary") {
                   page-break-before: avoid !important;
                   break-before: avoid !important;
                 }
                 
                 /* Prevent unwanted breaks in AI Resume Summary */
                 div:contains("AI Resume Summary") + div {
                   page-break-before: avoid !important;
                   break-before: avoid !important;
                 }
                 
                                   /* Enhanced Header for print */
                  .border-y.border-gray-200 {
                    background: #ffffff !important;
                    border-top: 1px solid #e5e7eb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    padding: 8px 0 !important;
                    margin-bottom: 6px !important;
                  }
                 
                                   /* Header elements for print - Centered */
                  .flex.flex-col.items-center.text-center.gap-2.mb-3 {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    text-align: center !important;
                    gap: 6px !important;
                    margin-bottom: 8px !important;
                  }
                 
                                   /* Avatar for print - Centered */
                  .w-20.h-20.rounded-full.border-2.border-gray-200.bg-green-600 {
                    width: 60px !important;
                    height: 60px !important;
                    border-radius: 50% !important;
                    border: 2px solid #e5e7eb !important;
                    background: #10b981 !important;
                  }
                 
                                   /* Name and title for print - Centered */
                  .text-2xl.font-bold.text-gray-900 {
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    color: #111827 !important;
                    margin: 0 !important;
                    text-align: center !important;
                  }
                 
                 /* Skills and contact layout for print */
                 .flex.flex-col.lg\\:flex-row.items-start.lg\\:items-center.justify-between.gap-4 {
                   display: flex !important;
                   align-items: center !important;
                   justify-content: space-between !important;
                   gap: 12px !important;
                 }
                 
                 /* Hide buttons and action elements in print */
                 .no-print,
                 button,
                 .bg-blue-600,
                 .bg-green-600,
                 .bg-gray-600,
                 .bg-gray-900.text-white,
                 [class*="bg-blue-"][class*="button"],
                 [class*="bg-green-"][class*="button"],
                 [class*="bg-gray-"][class*="button"],
                 input[type="button"],
                 [role="button"] {
                   display: none !important;
                 }
                 
                 /* Hide any action buttons or interactive elements */
                 .flex.justify-end.mb-2,
                 .flex.justify-end.mb-2 *,
                 *:contains("Scorecard"):not(.scorecard-content),
                 *:contains("Shortlisted"):not(.candidate-info),
                 *:contains("Back to List"):not(.content),
                 .action-buttons,
                 .header-actions,
                 .button-group {
                   display: none !important;
                 }
                 
                                   /* Header subtitle for print - Centered */
                  .text-gray-600.text-base {
                    color: #6b7280 !important;
                    font-size: 14px !important;
                    font-weight: 400 !important;
                    margin: 0 !important;
                    text-align: center !important;
                  }
                 
                 /* Skills in header for print */
                 .flex.flex-wrap.items-center.gap-2 {
                   display: flex !important;
                   flex-wrap: wrap !important;
                   align-items: center !important;
                   gap: 6px !important;
                 }
                 
                 /* Contact horizontal layout for print */
                 .flex.flex-wrap.items-center.gap-4 {
                   display: flex !important;
                   flex-wrap: wrap !important;
                   align-items: center !important;
                   gap: 16px !important;
                   margin-top: 0 !important;
                 }
                 
                 /* Skills layout for print */
                 .flex.flex-wrap.items-center.gap-2 {
                   display: flex !important;
                   flex-wrap: wrap !important;
                   align-items: center !important;
                   gap: 6px !important;
                   margin-right: 20px !important;
                 }
                 
                 /* Contact items - clean for print */
                 .flex.flex-wrap.items-center.gap-4 span {
                   display: flex !important;
                   align-items: center !important;
                   background: transparent !important;
                   color: #6b7280 !important;
                   padding: 0 !important;
                   border: none !important;
                   font-size: 12px !important;
                   font-weight: 400 !important;
                   gap: 5px !important;
                 }
                 
                 /* Skills for print */
                 .flex.flex-wrap.items-center.gap-2 span {
                   background: #f3f4f6 !important;
                   color: #374151 !important;
                   padding: 4px 10px !important;
                   border-radius: 12px !important;
                   font-size: 11px !important;
                   font-weight: 500 !important;
                   border: 1px solid #e5e7eb !important;
                   margin: 1px !important;
                 }
                 
                 /* Small icons for print */
                 .flex.flex-wrap.items-center.gap-4 span svg,
                 .flex.flex-wrap.items-center.gap-4 span .lucide {
                   width: 14px !important;
                   height: 14px !important;
                   color: #6b7280 !important;
                 }
                 
                 /* Skill tags in header for print */
                 .bg-gray-100.text-gray-800.px-3.py-1.rounded-full.text-sm.font-medium {
                   background-color: #f3f4f6 !important;
                   color: #374151 !important;
                   padding: 3px 10px !important;
                   border-radius: 9999px !important;
                   font-size: 12px !important;
                   font-weight: 500 !important;
                 }
                 
                 .bg-gray-200.text-gray-700.px-3.py-1.rounded-full.text-sm.font-medium {
                   background-color: #e5e7eb !important;
                   color: #374151 !important;
                   padding: 3px 10px !important;
                   border-radius: 9999px !important;
                   font-size: 12px !important;
                   font-weight: 500 !important;
                 }
                 
                 /* Avatar for print */
                 img[src*="dicebear"] {
                   width: 50px !important;
                   height: 50px !important;
                   border-radius: 50% !important;
                   border: 1px solid #e5e7eb !important;
                   background: #10b981 !important;
                 }
                 
                 /* Name and title for print */
                 .flex.items-center.gap-4 div,
                 .flex.items-center.gap-6 div {
                   font-size: 20px !important;
                   font-weight: 700 !important;
                   color: #1f2937 !important;
                   margin: 0 !important;
                 }
                 
                 .flex.items-center.gap-4 p,
                 .flex.items-center.gap-6 p {
                   font-size: 14px !important;
                   font-weight: 400 !important;
                   color: #6b7280 !important;
                   margin: 0 !important;
                 }
                 
                 .no-print { display: none !important; }
                 
                 /* Perfect Grid Layout for Print */
                 .xl\\:grid-cols-3 { 
                   grid-template-columns: 1.8fr 1fr !important; 
                   gap: 20px !important;
                 }
                 .xl\\:col-span-2 { grid-column: 1 / 2 !important; }
                 .xl\\:col-span-1 { 
                   grid-column: 2 / 3 !important; 
                   min-width: 260px !important;
                 }
                 
                 /* Clean Overall Score Card for Print */
                 .xl\\:col-span-1 > div {
                   background: #ffffff !important;
                   border: 1px solid #e5e7eb !important;
                   border-radius: 12px !important;
                   padding: 18px !important;
                   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                 }
                 
                 /* Hide icons in print */
                 .bg-gray-100.rounded-full.w-6.h-6,
                 .bg-gray-100.rounded-full.w-7.h-7 {
                   display: none !important;
                 }
                 
                 /* Improve AI Summary layout for print */
                 .flex.gap-3.items-start,
                 .flex.gap-4.items-start {
                   display: block !important;
                   margin-bottom: 16px !important;
                 }
                 
                 /* Fixed Circular Progress for Print */
                 .relative.flex.items-center.justify-center {
                   width: 140px !important;
                   height: 140px !important;
                   margin: 0 auto !important;
                   position: relative !important;
                 }
                 
                 svg.absolute.top-0.left-0 { 
                   width: 140px !important; 
                   height: 140px !important; 
                   position: absolute !important;
                   top: 0 !important;
                   left: 0 !important;
                   transform: rotate(-90deg) !important;
                   transform-origin: center !important;
                 }
                 
                 /* Progress circle styling for print */
                 svg circle[stroke="#3b82f6"] {
                   stroke: #3b82f6 !important;
                   stroke-width: 12px !important;
                   fill: none !important;
                 }
                 
                 svg circle[stroke="#e8e8e8"] {
                   stroke: #e8e8e8 !important;
                   stroke-width: 12px !important;
                   fill: none !important;
                 }
                 
                 /* Score text for print - perfectly centered */
                 .absolute.inset-0.flex.items-center.justify-center.z-10 span {
                   font-size: 26px !important;
                   font-weight: 700 !important;
                   color: #1f2937 !important;
                   line-height: 1 !important;
                   text-align: center !important;
                 }
                 
                 /* Ensure SVG circles render properly in print */
                 svg {
                   display: block !important;
                   opacity: 1 !important;
                   visibility: visible !important;
                 }
                 
                 svg circle {
                   vector-effect: non-scaling-stroke !important;
                   opacity: 1 !important;
                   visibility: visible !important;
                 }
                 
                 /* Force visibility for print */
                 svg circle[stroke="#e8e8e8"] {
                   stroke: #e8e8e8 !important;
                   opacity: 1 !important;
                 }
                 
                 svg circle[stroke="#3b82f6"] {
                   stroke: #3b82f6 !important;
                   opacity: 1 !important;
                 }
                 
                 /* Score section for print */
                 .text-center.py-8 {
                   padding: 24px 16px !important;
                 }
                 
                 /* Enhanced Added Notes Section for Print */
                 .bg-white.rounded-xl.shadow-sm.border.border-gray-200.p-6 {
                   background: #ffffff !important;
                   border: 1px solid #e5e7eb !important;
                   border-radius: 8px !important;
                   padding: 20px !important;
                   box-shadow: none !important;
                   margin-bottom: 16px !important;
                 }
                 
                 /* Added Notes textarea for print */
                 textarea.border-0.bg-transparent {
                   background: transparent !important;
                   border: none !important;
                   color: #374151 !important;
                   font-size: 12px !important;
                   line-height: 1.5 !important;
                   min-height: 100px !important;
                   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                 }
                 
                 /* Hide Add Note button and success message in print */
                 .bg-gray-900.text-white,
                 .text-green-600 {
                   display: none !important;
                 }
                 
                 /* Enhanced Application Details for Print */
                 .application-detail-item {
                   padding-bottom: 2px !important;
                   margin-bottom: 4px !important;
                 }
                 
                 /* Reduce grid gap for Application Details in print */
                 .grid.grid-cols-1.sm\\:grid-cols-2.gap-x-8.gap-y-5 {
                   gap: 8px 32px !important; /* Much smaller vertical gap */
                 }
                 
                 /* Override Tailwind's block class spacing */
                 .block.text-sm.font-semibold.text-gray-700 {
                   display: block !important;
                   margin-bottom: 0 !important;
                   padding-bottom: 0 !important;
                 }
                 
                 .application-detail-item span {
                   color: #374151 !important;
                   font-size: 12px !important;
                   font-weight: 600 !important;
                   margin-bottom: 0px !important;
                   line-height: 1.2 !important;
                 }
                 
                 .application-detail-item p {
                   color: #111827 !important;
                   font-size: 14px !important;
                   font-weight: 500 !important;
                   margin: 0 !important;
                   margin-top: -2px !important;
                   line-height: 1.3 !important;
                   padding: 0 !important;
                 }
                 
                 /* Remove any default spacing from block elements in application details */
                 .application-detail-item * {
                   padding-top: 0 !important;
                   padding-bottom: 0 !important;
                 }
                 
                 /* Refined skill tags for print */
                 .skill-tag-refined {
                   background-color: #f9fafb !important;
                   color: #374151 !important;
                   padding: 6px 10px !important;
                   border-radius: 4px !important;
                   font-size: 12px !important;
                   font-weight: 500 !important;
                   border: 1px solid #e5e7eb !important;
                   margin: 1px !important;
                   display: inline-block !important;
                   line-height: 1.2 !important;
                 }
                 
                 /* Legacy skill tags for print */
                 .skill-tag {
                   background-color: #f3f4f6 !important;
                   color: #374151 !important;
                   padding: 6px 12px !important;
                   border-radius: 6px !important;
                   font-size: 12px !important;
                   font-weight: 500 !important;
                   border: 1px solid #e5e7eb !important;
                   margin: 2px !important;
                   display: inline-block !important;
                 }
                 
                 /* Application Details grid for print */
                 .grid.grid-cols-1.sm\\:grid-cols-2 {
                   gap: 16px 24px !important;
                 }
                 
                 /* Section titles for print */
                 div.text-xl.font-bold.text-gray-900 {
                   color: #111827 !important;
                   font-size: 18px !important;
                   font-weight: 700 !important;
                   margin-bottom: 20px !important;
                 }
                 
                 div.text-lg.font-semibold.text-gray-900 {
                   color: #111827 !important;
                   font-size: 16px !important;
                   font-weight: 600 !important;
                   margin-bottom: 10px !important;
                 }
                 
                 /* About text for print */
                 .text-base.text-gray-700.leading-relaxed {
                   color: #374151 !important;
                   font-size: 14px !important;
                   line-height: 1.5 !important;
                 }
                 
                 /* Key Skills container for print */
                 .flex.flex-wrap.gap-2 {
                   gap: 6px !important;
                   line-height: 1.3 !important;
                 }
                 
                 /* Match label for print */
                 .text-orange-500 {
                   color: #f97316 !important;
                   font-size: 11px !important;
                   font-weight: 600 !important;
                 }
                 
                 /* Overall Score title for print */
                 .text-xl.font-bold.text-gray-900 {
                   font-size: 16px !important;
                   font-weight: 700 !important;
                   color: #1f2937 !important;
                   margin-bottom: 16px !important;
                 }
                 
                 /* Consider button for print */
                 .bg-blue-100.text-gray-700 {
                   background-color: #dbeafe !important;
                   color: #374151 !important;
                   border: 1px solid #93c5fd !important;
                   border-radius: 6px !important;
                   padding: 8px 16px !important;
                   font-size: 12px !important;
                   font-weight: 500 !important;
                 }
                 
                 /* Enhanced Progress bars for print - AI Scorecard */
                 .scorecard-item .bg-gray-200 {
                   background-color: #e5e7eb !important;
                   height: 6px !important;
                   border-radius: 6px !important;
                   overflow: hidden !important;
                 }
                 
                 .scorecard-item .bg-blue-600 {
                   background: #3b82f6 !important;
                   height: 6px !important;
                   border-radius: 6px !important;
                   box-shadow: none !important;
                 }
                 
                 /* Scorecard items for print */
                 .scorecard-item {
                   padding: 8px 0 !important;
                   border-bottom: 1px solid #f3f4f6 !important;
                   margin-bottom: 8px !important;
                 }
                 
                 .scorecard-item:last-child {
                   border-bottom: none !important;
                   margin-bottom: 0 !important;
                 }
                 
                 /* Legacy support for other progress bars */
                 .w-full.bg-gray-200.rounded-full.h-1\\.5 {
                   background: #e5e7eb !important;
                   height: 6px !important;
                   border-radius: 6px !important;
                 }
                 
                 .bg-blue-600.h-1\\.5.rounded-full {
                   background: #3b82f6 !important;
                   height: 6px !important;
                   border-radius: 6px !important;
                 }
                 
                 /* Typography Scale for Print */
                 .text-5xl { font-size: 28px !important; font-weight: 800 !important; }
                 .text-2xl { font-size: 18px !important; font-weight: 700 !important; }
                 .text-xl { font-size: 16px !important; font-weight: 600 !important; }
                 .text-lg { font-size: 15px !important; font-weight: 600 !important; }
                 .text-base { font-size: 14px !important; font-weight: 500 !important; }
                 .text-sm { font-size: 13px !important; font-weight: 500 !important; }
                 
                 /* Improve spacing for print */
                 .space-y-4 > * + * { margin-top: 12px !important; }
                 .space-y-5 > * + * { margin-top: 14px !important; }
                 .space-y-6 > * + * { margin-top: 16px !important; }
                 .mb-4 { margin-bottom: 12px !important; }
                 .mb-6 { margin-bottom: 16px !important; }
                 .mt-4 { margin-top: 12px !important; }
                 .mt-6 { margin-top: 16px !important; }
                 
                 /* Better AI Scorecard section */
                 .flex.justify-between.items-center.mb-2 div {
                   font-size: 14px !important;
                   font-weight: 600 !important;
                   color: #374151 !important;
                 }
                 
                 .flex.justify-between.items-center.mb-2 span {
                   font-size: 14px !important;
                   font-weight: 700 !important;
                   color: #1f2937 !important;
                 }
                 
                 /* Key Strength and Concern Cards */
                 .bg-green-50 { 
                   background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%) !important; 
                   border: 2px solid #10b981 !important;
                   border-radius: 12px !important;
                   padding: 16px !important;
                 }
                 .bg-red-50 { 
                   background: linear-gradient(135deg, #fef2f2 0%, #fef1f1 100%) !important; 
                   border: 2px solid #ef4444 !important;
                   border-radius: 12px !important;
                   padding: 16px !important;
                 }
                 
                 /* Skill Tags for Print */
                 .bg-gray-100.text-gray-800 {
                   background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
                   color: #1e293b !important;
                   padding: 6px 12px !important;
                   border-radius: 16px !important;
                   font-size: 12px !important;
                   font-weight: 600 !important;
                   border: 1px solid #cbd5e1 !important;
                   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                 }
                 
                 /* Avatar styling for print */
                 img[src*="dicebear"] {
                   width: 65px !important;
                   height: 65px !important;
                   border: 3px solid rgba(255, 255, 255, 0.5) !important;
                   box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2) !important;
                 }
                 

                 
                 /* Progress bars enhancement - ensure proper rendering */
                 .bg-blue-600 { 
                   background: #3b82f6 !important; 
                   border-radius: 4px !important;
                 }
                 
                 /* AI Scorecard progress bars for print */
                 .scorecard-item .bg-blue-600 {
                   background: #3b82f6 !important;
                   display: block !important;
                 }
               }
               
               /* 
                * Clean PDF Print Settings - No Headers/Footers
                * For best results, also disable headers/footers in browser print settings:
                * Chrome: Print > More settings > Headers and footers (OFF)
                * Firefox: Print > Headers & Footers > Blank
                */
               @page {
                 margin: 0.4in;
                 size: A4;
                 margin-top: 0.4in;
                 margin-bottom: 0.4in;
                 /* Remove default browser headers and footers */
                 @top-left { content: ""; }
                 @top-center { content: ""; }
                 @top-right { content: ""; }
                 @bottom-left { content: ""; }
                 @bottom-center { content: ""; }
                 @bottom-right { content: ""; }
               }
               
               /* Additional CSS to ensure no headers/footers */
               @media print {
                 html, body {
                   -webkit-print-color-adjust: exact !important;
                   print-color-adjust: exact !important;
                 }
                 
                 /* Remove any browser-generated headers */
                 * {
                   -webkit-print-header: none !important;
                   -webkit-print-footer: none !important;
                 }
                 
                 /* Force clean print layout */
                 @page :first {
                   margin-top: 0.4in !important;
                 }
                 
                 @page :left {
                   margin: 0.4in !important;
                 }
                 
                 @page :right {
                   margin: 0.4in !important;
                 }
                 
                 /* Completely remove any space for headers/footers */
                 body {
                   margin: 0 !important;
                   padding: 0 !important;
                 }
                 
                 /* Ensure print content fills page without headers */
                 .min-h-screen {
                   margin: 0 !important;
                   padding: 0 !important;
                 }
               }
               
               /* Overall layout improvements */
               .scorecard-wrapper {
                 max-width: 100% !important;
                 overflow: hidden !important;
               }
               
               /* Clean layout styling */
               .header-layout {
                 display: flex !important;
                 align-items: center !important;
                 justify-content: space-between !important;
                 width: 100% !important;
               }
               
               .header-left {
                 display: flex !important;
                 align-items: center !important;
                 gap: 16px !important;
               }
               
               .header-right {
                 display: flex !important;
                 align-items: center !important;
                 gap: 24px !important;
               }
            </style>
          </head>
                                                                                       <body>
               <svg style="position: absolute; width: 0; height: 0;">
                 <defs>
                   <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                     <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
                   </linearGradient>
                 </defs>
               </svg>
               <div class="scorecard-wrapper">
                 ${printContent}
               </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 100);
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      toast.success('Print dialog opened! Save as PDF from the print dialog.');
      
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to open print dialog. Please use Ctrl+P to print.');
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
            
            {/* Show status indicator if already shortlisted or rejected */}
            {currentStatus === 'shortlisted' && (
              <>
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
          <div className="border-y border-gray-200 py-3 mb-2">
            {/* Top Row: Avatar, Name & Title - Centered */}
            <div className="flex flex-col items-center text-center gap-2 mb-3">
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
                    <div className="text-sm font-semibold text-red-800 mb-4">AI Resume Summary</div>
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
                    <div className="text-lg font-bold text-red-800 mb-8">AI Scorecard</div>
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

                {/* Application Details - Enhanced Design */}
                <div className="p-4 md:p-6 border rounded-xl bg-gray-50">
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

                {/* Interview Transcript Section - Only show if transcript data exists */}
                {resumeData.interviewEvaluation && resumeData.interviewEvaluation.evaluationResults && resumeData.interviewEvaluation.evaluationResults.length > 0 && (
                    <div className="p-4 md:p-6 border rounded-xl bg-gray-50">
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

            {/* Right Column - Redesigned to match image */}
            <div className="xl:col-span-1">
                <div className="bg-gray-50 rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
                    {/* Overall Score Section - Match Reference Image */}
                    <div className="text-center py-8">
                        <div className="text-orange-500 text-sm font-semibold mb-3">{match.label}</div>
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

                    {/* Added Notes Section - Enhanced Design */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 added-notes-section">
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
        </div>
      </div>
    </div>
  );
};

export default ResumeDetailsView; 