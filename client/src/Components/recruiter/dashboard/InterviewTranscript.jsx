import React from 'react';

const InterviewTranscript = ({ interviewEvaluation }) => {
  if (!interviewEvaluation || !interviewEvaluation.evaluationResults) {
    return null;
  }

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
                {result.summary || result.reason}
              </p>
            </div>

            {/* Bottom Row - Score only */}
            <div className="flex justify-end">
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