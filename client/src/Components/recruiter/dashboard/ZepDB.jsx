import React, { useState } from 'react';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import ZepDBCandidateDetail from './ZepDBCandidateDetail';

// Custom CSS for hiding scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Safari and Chrome */
  }
`;

const ZepDB = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // Call Gemini API to extract key information
      const extractedInfo = await extractQueryInfo(prompt);
      
      // Fetch candidates based on extracted information
      const candidates = await fetchCandidates(extractedInfo);
      
      setResults({
        query: prompt,
        extractedInfo,
        candidates
      });
    } catch (err) {
      setError('Failed to process your query. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractQueryInfo = async (userPrompt) => {
    // This will be handled by the backend Gemini API
    // For now, return empty object as backend will process it
    return {};
  };

  const fetchCandidates = async (filters) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/zepdb/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.data.accessToken}`
        },
        body: JSON.stringify({
          query: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch candidates');
      }

      const data = await response.json();
      return data.data.candidates || [];
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'screening': 'bg-blue-100 text-blue-800',
      'submitted': 'bg-purple-100 text-purple-800',
      'shortlisted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'offered': 'bg-emerald-100 text-emerald-800',
      'hired': 'bg-indigo-100 text-indigo-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const capitalizeStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleBackToResults = () => {
    setSelectedCandidate(null);
  };

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="flex flex-col h-screen bg-gray-50 w-full">
      {!results ? (
        // Initial state with input
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">ZEPDB</h1>
            <p className="text-gray-600 text-base md:text-lg lg:text-xl px-4 max-w-3xl">
              Your AI-powered recruitment assistant. Ask for resumes, filter candidates, and find the perfect match.
            </p>
          </div>

          {/* Input Area */}
          <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl px-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-xl px-4 py-3 md:py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                />
                
                {/* Send button */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <button
                    type="submit"
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={!prompt.trim() || loading}
                  >
                    <Send className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </form>
            
            {/* Example prompts */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-xs md:text-sm mb-3">Try asking:</p>
              <div className="flex flex-wrap justify-center gap-2 px-2">
                <button
                  onClick={() => setPrompt("Give me resumes for software developers with experience greater than 1 year")}
                  className="text-xs bg-white text-gray-700 border border-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Software developers &gt; 1 year
                </button>
                <button
                  onClick={() => setPrompt("Show me candidates with React experience")}
                  className="text-xs bg-white text-gray-700 border border-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  React developers
                </button>
                <button
                  onClick={() => setPrompt("Find candidates with 3+ years of experience")}
                  className="text-xs bg-white text-gray-700 border border-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  3+ years experience
                </button>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Processing your query...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mt-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      ) : selectedCandidate ? (
        // Candidate Detail View
        <ZepDBCandidateDetail 
          candidate={selectedCandidate} 
          onBack={handleBackToResults} 
        />
      ) : (
        // Results state
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <button 
                  onClick={() => setResults(null)}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to ZepDB
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Candidate List</h1>
                <p className="text-gray-600 mt-1">
                  Results for: "{results.query}"
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-hidden p-6">
            {results.candidates.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-600">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
                {/* Status tabs */}
                <div className="flex items-center space-x-2 p-6 pb-0 overflow-x-auto flex-shrink-0">
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap">
                    All ({results.candidates.length})
                  </button>
                  <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border whitespace-nowrap">
                    Screening ({results.candidates.filter(c => c.status === 'screening').length})
                  </button>
                  <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border whitespace-nowrap">
                    Scheduled ({results.candidates.filter(c => c.status === 'scheduled').length})
                  </button>
                  <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border whitespace-nowrap">
                    Rejected ({results.candidates.filter(c => c.status === 'rejected').length})
                  </button>
                  <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border whitespace-nowrap">
                    Shortlisted ({results.candidates.filter(c => c.status === 'shortlisted').length})
                  </button>
                  <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border whitespace-nowrap">
                    Submitted ({results.candidates.filter(c => c.status === 'submitted').length})
                  </button>
                </div>

                {/* Table Container with Scroll */}
                <div className="flex-1 overflow-auto p-6 pt-4 scrollbar-hide">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200">
                          <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">CANDIDATE</th>
                          <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">APPLIED DATE</th>
                          <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">SCORE</th>
                          <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                                              {results.candidates.map((candidate) => (
                        <tr 
                          key={candidate.id} 
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCandidateClick(candidate)}
                        >
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-4 ${getAvatarColor(candidate.name)}`}>
                                  {getInitials(candidate.name)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">{candidate.name}</div>
                                  <div className="text-sm text-gray-500">{candidate.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600">{candidate.appliedDate}</td>
                            <td className="py-4 px-4 font-semibold text-gray-800">{candidate.score}</td>
                                                      <td className="py-4 px-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                              {capitalizeStatus(candidate.status)}
                            </span>
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ZepDB;

