import React from 'react';

// Utility function to generate background color based on company name
const getInitialsBackgroundColor = (companyName) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500'
  ];
  
  const hash = companyName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

// Utility function to get initials from company name
const getInitials = (companyName) => {
  return companyName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const CompanyDetails = ({ company, onBack }) => (
  <div className="px-16 py-10 w-full min-h-screen">
    <button onClick={onBack} className="text-blue-600 text-sm font-medium mb-6 hover:underline flex items-center gap-1">
      <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      COMPANY DETAILS
    </button>
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-14 h-14 rounded flex items-center justify-center text-white text-xl font-bold ${getInitialsBackgroundColor(company.name)}`}>
        {getInitials(company.name)}
      </div>
      <h1 className="text-3xl font-bold text-black">{company.name}</h1>
    </div>
    <div className="flex flex-wrap gap-3 mb-6">
      <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-base font-medium border border-gray-200">
        Employee : {company.employeeNumber || 'N/A'}
      </span>
      <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-base font-medium border border-gray-200">
        Company Type : {company.companyType || 'N/A'}
      </span>
      <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-base font-medium border border-gray-200">
        Domain : {company.domain || 'N/A'}
      </span>
    </div>
    <div className="mb-2 text-xl font-semibold text-gray-800">About</div>
    <div className="bg-gray-50 border border-gray-300 rounded-xl p-5 text-gray-700 text-base whitespace-pre-line">
      {company.aboutSection || 'No about section available.'}
    </div>
  </div>
);

export default CompanyDetails; 