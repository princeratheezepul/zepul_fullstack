import React from 'react';
import { Circle } from 'lucide-react';

const InterviewTranscript = ({ interviewEvaluation }) => {
  if (!interviewEvaluation || !interviewEvaluation.evaluationResults) {
    return null;
  }

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

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-6 lg:col-span-2">
      <div className="text-xl font-bold text-gray-800 mb-6">Interview Transcript</div>
      
      <div className="space-y-6">
        {interviewEvaluation.evaluationResults.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6">
            {/* Question */}
            <div className="mb-4">
              <div className="font-light text-gray-900 text-lg">
                Q{index + 1}. {result.question}
              </div>
            </div>

            {/* Evaluation Summary */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed text-sm">
                {result.reason}
              </p>
            </div>

            {/* Bottom Row - Confidence and Score */}
            <div className="flex justify-between items-center">
              {/* Confidence Level */}
              {/* <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getConfidenceColor(result.confidence)}`}>
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
  );
};

export default InterviewTranscript; 