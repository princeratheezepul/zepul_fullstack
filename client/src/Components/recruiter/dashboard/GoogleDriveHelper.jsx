import React from 'react';
import { Download, Folder, ArrowRight, CheckCircle } from 'lucide-react';

const GoogleDriveHelper = ({ driveLink, onClose }) => {
  const steps = [
    {
      icon: <Download size={20} />,
      title: "Download Files",
      description: "Open your Google Drive folder and download all resume files"
    },
    {
      icon: <Folder size={20} />,
      title: "Extract Files",
      description: "Extract the downloaded ZIP file to a folder on your computer"
    },
    {
      icon: <ArrowRight size={20} />,
      title: "Upload Folder",
      description: "Use the 'Upload Folder' option in the bulk upload feature"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Google Drive Setup Guide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manual Download Method</h3>
                <p className="text-gray-600">This is the recommended approach for processing your Google Drive files</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Step {index + 1}: {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Drive Link */}
          {driveLink && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Your Google Drive Folder:</h4>
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {driveLink}
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Got It, Close
            </button>
            {driveLink && (
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Open Drive Folder
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveHelper;
