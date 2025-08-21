import React from 'react';
import { ArrowLeft, Mail, Phone, Building, MapPin, HelpCircle, Briefcase } from 'lucide-react';

// Circular Progress Component
const CircularProgress = ({ percentage, size = 144, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-600"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

const ZepDBCandidateDetail = ({ candidate, onBack }) => {
  if (!candidate) return null;

  const getMatchLabel = (score) => {
    if (score >= 80) return { label: 'Strong Match', color: 'text-green-600' };
    if (score >= 60) return { label: 'Good Match', color: 'text-green-500' };
    return { label: 'Less Match', color: 'text-red-600' };
  };

  const match = getMatchLabel(candidate.overallScore || candidate.ats_score || 0);
  const score = Math.round(candidate.overallScore || candidate.ats_score || 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center py-0 px-0 bg-gray-50 overflow-auto">
        <div className="w-full max-w-6xl bg-gray-50">
          {/* Back Button */}
          <div className="bg-gray-50 w-full px-4 md:px-0 pt-6 pb-2 flex-shrink-0">
            <div
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Candidate List
            </div>
          </div>

          {/* This div acts as the "content" for the screen display - simpler layout */}
          <div className="bg-white p-4 md:p-8 rounded-lg w-full mb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${candidate.name}`} alt={candidate.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200" />
                <div>
                  <div className="text-3xl font-bold text-gray-900">{candidate.name}</div>
                  <p className="text-gray-600 text-lg">{candidate.role || candidate.title || 'Software Developer'}</p>
                </div>
              </div>
            </div>

            {/* Skills & Contact */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-y py-4 mb-8 gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(candidate.skills || []).slice(0, 4).map(skill => (
                  <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                ))}
                {candidate.skills && candidate.skills.length > 4 && (
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">+{candidate.skills.length - 4}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2"><Mail size={16}/> {candidate.email}</span>
                <span className="flex items-center gap-2"><Phone size={16}/> {candidate.phone}</span>
                <span className="flex items-center gap-2"><Briefcase size={16}/> {candidate.experience}</span>
                <span className="flex items-center gap-2"><MapPin size={16}/> {candidate.location}</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left & Middle Column */}
              <div className="col-span-1 lg:col-span-2 space-y-8">
                {/* AI Summary & Scorecard */}
                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="text-lg font-bold text-black mb-8">AI Resume Summary</div>
                  <div className="space-y-8">
                    {candidate.aiSummary && Object.entries(candidate.aiSummary).map(([key, value]) => (
                      <div key={key} className="flex gap-4 items-start">
                        <div className="bg-gray-200 rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1">
                          <HelpCircle size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 capitalize text-base mb-2">
                            {key === 'skillMatch' ? 'Skill Match' : 
                             key === 'competitiveFit' ? 'Competitive Fit & Market Prediction' : 
                             key === 'consistencyCheck' ? 'Consistency Check' :
                             key === 'technicalExperience' ? 'Technical Experience' : 
                             key === 'projectExperience' ? 'Project Experience' : 
                             key === 'keyAchievements' ? 'Key Achievements' :
                             key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-10 border-t border-gray-300" />
                  
                  <div className="text-lg font-bold text-black mb-8">AI Scorecard</div>
                  <div className="space-y-6">
                    {candidate.aiScorecard && Object.entries(candidate.aiScorecard).map(([key, value]) => (
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
                    <div><span className="font-semibold text-gray-800 block mb-1">Position Applied</span><p>{candidate.applicationDetails?.position || candidate.role || 'N/A'}</p></div>
                    <div><span className="font-semibold text-gray-800 block mb-1">Application Date</span><p>{candidate.applicationDetails?.date || candidate.appliedDate || 'N/A'}</p></div>
                    <div><span className="font-semibold text-gray-800 block mb-1">Notice Period</span><p>{candidate.applicationDetails?.noticePeriod || candidate.noticePeriod || 'N/A'}</p></div>
                    <div><span className="font-semibold text-gray-800 block mb-1">Application Source</span><p>{candidate.applicationDetails?.source || candidate.source || 'Website'}</p></div>
                  </div>
                  <div className="mt-6">
                    <div className="font-semibold text-gray-800">About</div>
                    <p className="text-gray-600 mt-1">{candidate.about || 'No additional information provided.'}</p>
                  </div>
                  <div className="mt-6">
                    <div className="font-semibold text-gray-800">Key Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(candidate.skills || []).map(skill => (
                        <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                      ))}
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
                  {/* Circular Progress */}
                  <div className="relative my-2 flex justify-center">
                    <CircularProgress percentage={score} size={144} strokeWidth={12} />
                  </div>
                  {/* Recommendation */}
                  <div className="w-full text-center bg-blue-100 text-blue-900 font-medium rounded-xl py-2 px-3 mb-4">
                    {candidate.recommendation || 'Consider with caution'}
                  </div>
                  {/* Key Strength */}
                  <div className="w-full mb-4 rounded-xl p-4 bg-green-50">
                    <div className="font-semibold text-gray-800 mb-2">Key Strength</div>
                    <ul className="list-disc pl-5 text-gray-800">
                      {(candidate.keyStrength || []).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {/* Potential Concern */}
                  <div className="w-full rounded-xl p-4 bg-red-50 mb-4">
                    <div className="font-semibold text-gray-800 mb-2">Potential Concern</div>
                    <ul className="list-disc pl-5 text-gray-800">
                      {(candidate.potentialConcern || []).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZepDBCandidateDetail;
