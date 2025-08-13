import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Link, Folder, X, Loader2, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import GoogleDriveHelper from './GoogleDriveHelper';

const BulkUploadModal = ({ onClose, jobDetails }) => {
  const [uploadMethod, setUploadMethod] = useState(''); // 'folder' or 'drive'
  const [driveLink, setDriveLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [showDriveHelper, setShowDriveHelper] = useState(false);
  const folderInputRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = () => {
    toast.error('Session expired. Please log in again.');
    logout();
    navigate('/recruiter/login');
  };

  const handleFolderUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress({ status: 'processing', totalFiles: files.length, processedFiles: 0, successfulFiles: 0, failedFiles: 0 });

    try {
      const formData = new FormData();
      formData.append('uploadMethod', 'folder');

      // Add all files to FormData
      Array.from(files).forEach((file, index) => {
        formData.append('files', file);
      });

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/bulk-upload/${jobDetails.jobId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          credentials: 'include',
          body: formData
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error('Failed to start bulk upload');
      }

      const data = await response.json();
      const bulkJobId = data.jobId;

      // Start polling for progress
      pollProgress(bulkJobId);

    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to start bulk upload: ' + error.message);
      setIsProcessing(false);
      setProgress(null);
    }
  }, [jobDetails.jobId]);

  const handleDriveUpload = async () => {
    if (!driveLink.trim()) {
      toast.error('Please enter a Google Drive link');
      return;
    }

    setIsProcessing(true);
    setProgress({ status: 'processing', totalFiles: 0, processedFiles: 0, successfulFiles: 0, failedFiles: 0 });

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/bulk-upload/${jobDetails.jobId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            uploadMethod: 'drive',
            driveLink: driveLink.trim()
          })
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to start drive upload';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Drive upload failed: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const bulkJobId = data.jobId;

      // Start polling for progress
      pollProgress(bulkJobId);

    } catch (error) {
      console.error('Drive upload error:', error);
      let errorMessage = 'Failed to process drive upload';
      if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        duration: 8000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-line'
        }
      });
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const pollProgress = async (bulkJobId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/bulk-upload/${bulkJobId}/status`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to view this bulk upload job.');
        }
        throw new Error('Failed to fetch progress');
      }

      const progressData = await response.json();
      setProgress(progressData);

      if (progressData.status === 'completed' || progressData.status === 'failed') {
        setIsProcessing(false);
        
        // Fetch results
        const resultsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/resumes/bulk-upload/${bulkJobId}/results`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          setResults(resultsData);
        } else if (resultsResponse.status === 401) {
          handleAuthError();
          return;
        }
      } else {
        // Continue polling
        setTimeout(() => pollProgress(bulkJobId), 2000);
      }
    } catch (error) {
      console.error('Progress polling error:', error);
      if (error.message.includes('Authentication failed') || error.message.includes('401')) {
        handleAuthError();
      } else {
        toast.error('Failed to fetch progress: ' + error.message);
        setIsProcessing(false);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFolderUpload,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true,
    disabled: isProcessing
  });

  const handleFolderSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleFolderUpload(files);
    }
  };

  const resetModal = () => {
    setUploadMethod('');
    setDriveLink('');
    setIsProcessing(false);
    setProgress(null);
    setResults(null);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetModal();
      onClose();
    }
  };

  // Show results if processing is complete
  if (results) {
    const successRate = results.total > 0 ? Math.round((results.successful / results.total) * 100) : 0;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Upload Complete!</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Successfully processed {results.successful} out of {results.total} resumes
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                <div className="text-sm text-blue-800">Total Files</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                <div className="text-sm text-green-800">Successfully Processed</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
                <div className="text-sm text-purple-800">Success Rate</div>
              </div>
            </div>

            {results.failedFiles && results.failedFiles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Failed Files</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {results.failedFiles.map((failedFile, index) => (
                    <div key={index} className="flex items-start gap-3 mb-3 last:mb-0">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-red-900 truncate">{failedFile.fileName}</p>
                        <p className="text-sm text-red-700">({failedFile.error})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleClose}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={resetModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Upload More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show progress if processing
  if (isProcessing || progress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Resumes</h3>
            <p className="text-gray-600 mb-6">Please wait while we analyze your resumes...</p>
            
            {progress && (
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: progress.totalFiles > 0 
                        ? `${(progress.processedFiles / progress.totalFiles) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Total Files: {progress.totalFiles}</div>
                  <div>Processed: {progress.processedFiles}</div>
                  <div>Successful: {progress.successfulFiles}</div>
                  <div>Failed: {progress.failedFiles}</div>
                </div>
                {progress.currentFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Currently processing: {progress.currentFile}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Resume Upload</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadMethod ? (
            <div className="space-y-6">
              <p className="text-gray-600 text-center">
                Choose how you want to upload multiple resumes
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Folder Upload */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  onClick={() => setUploadMethod('folder')}
                >
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Folder</h3>
                  <p className="text-sm text-gray-600">
                    Select a folder containing PDF and DOCX resume files
                  </p>
                </div>

                {/* Google Drive Link */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
                  onClick={() => setUploadMethod('drive')}
                >
                  <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Drive Link</h3>
                  <p className="text-sm text-gray-600">
                    Provide a Google Drive folder link containing resumes
                  </p>
                </div>
              </div>
            </div>
          ) : uploadMethod === 'folder' ? (
            <div className="space-y-6">
              <button
                onClick={() => setUploadMethod('')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to options
              </button>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume Folder</h3>
                
                <div 
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    PDF and DOCX files only
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Or select a folder:</p>
                  <input
                    ref={folderInputRef}
                    type="file"
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderSelect}
                    className="hidden"
                    accept=".pdf,.docx"
                  />
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Select Folder
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setUploadMethod('')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to options
              </button>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Google Drive Folder</h3>
                
                <div className="max-w-md mx-auto space-y-4">
                  <input
                    type="text"
                    placeholder="Paste Google Drive folder link here..."
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <button
                    onClick={handleDriveUpload}
                    disabled={!driveLink.trim()}
                    className="w-full bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Process Drive Folder
                  </button>
                </div>


              </div>
            </div>
          )}
        </div>
      </div>
      
      {showDriveHelper && (
        <GoogleDriveHelper
          driveLink={driveLink}
          onClose={() => setShowDriveHelper(false)}
        />
      )}
    </div>
  );
};

export default BulkUploadModal;
