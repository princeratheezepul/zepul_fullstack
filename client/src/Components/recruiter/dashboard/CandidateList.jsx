import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';

const candidates = [
  {
    name: 'Michael Singh',
    email: 'Michael.singh@gmail.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    appliedDate: '11 May, 2025',
    score: '85%',
    status: 'Scheduled',
  },
  {
    name: 'Michael Singh',
    email: 'Michael.singh@gmail.com',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    appliedDate: '11 May, 2025',
    score: '85%',
    status: 'In Screen',
  },
  {
    name: 'Michael Singh',
    email: 'Michael.singh@gmail.com',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    appliedDate: '11 May, 2025',
    score: '85%',
    status: 'Submitted',
  },
    {
    name: 'Michael Singh',
    email: 'Michael.singh@gmail.com',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    appliedDate: '11 May, 2025',
    score: '85%',
    status: 'Shortlisted',
  },
  {
    name: 'Michael Singh',
    email: 'Michael.singh@gmail.com',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    appliedDate: '11 May, 2025',
    score: '85%',
    status: 'Rejected',
  },
];

const statusColors = {
    Scheduled: 'bg-yellow-100 text-yellow-800',
    'In Screen': 'bg-blue-100 text-blue-800',
    Submitted: 'bg-purple-100 text-purple-800',
    Shortlisted: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
};

const CandidateList = ({ job, onBack }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleOpenSidebar = (candidate) => {
    setSelectedCandidate(candidate);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-3xl font-bold text-gray-900">Candidate List</div>
            <p className="text-gray-600 mt-1">Managing candidate for Senior Frontend Developer</p>
          </div>
          <button onClick={onBack} className="text-blue-600 hover:underline">&larr; Back to job details</button>
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-semibold">All (38)</button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">In screen (38)</button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">Scheduled (24)</button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">Rejected (14)</button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">Shortlisted (14)</button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">Submitted (14)</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Candidate</th>
                <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Applied date</th>
                <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Score</th>
                <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Status</th>
                <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Notes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <img src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded-full mr-4"/>
                      <div>
                        <div className="font-semibold text-gray-800">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{candidate.appliedDate}</td>
                  <td className="py-4 px-4 font-semibold text-gray-800">{candidate.score}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[candidate.status]}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button onClick={() => handleOpenSidebar(candidate)} className="text-gray-500 hover:text-gray-800 p-2 rounded-md">
                      <FileText size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-grey-200 bg-opacity-10 z-40 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseSidebar}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedCandidate && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xl font-semibold text-gray-800">Add Notes for {selectedCandidate.name}</div>
                <button onClick={handleCloseSidebar} className="text-gray-500 hover:text-gray-800">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 flex-grow">
              <textarea
                className="w-full h-full resize-none text-base p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your note"
              ></textarea>
            </div>
            <div className="p-6 bg-white border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors">
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateList; 