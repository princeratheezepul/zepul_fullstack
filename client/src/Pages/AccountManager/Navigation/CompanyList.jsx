import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import CompanyDetails from './CompanyDetails.jsx';

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

const CompanyList = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching companies...');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response received:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      if (data.success) {
        setCompanies(data.companies || []);
      } else {
        setError(data.message || 'Failed to fetch companies');
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  if (selectedCompany) {
    return <CompanyDetails company={selectedCompany} onBack={() => setSelectedCompany(null)} />;
  }

  if (loading) {
    return (
      <div className="px-16 py-10 w-full min-h-screen">
        <h1 className="text-3xl font-bold text-black mb-1">Company List</h1>
        <p className="text-base text-gray-500 mb-8">Manage and track all your job posting here</p>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading companies...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-16 py-10 w-full min-h-screen">
        <h1 className="text-3xl font-bold text-black mb-1">Company List</h1>
        <p className="text-base text-gray-500 mb-8">Manage and track all your job posting here</p>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <button 
              onClick={fetchCompanies} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-16 py-10 w-full min-h-screen">
      <h1 className="text-3xl font-bold text-black mb-1">Company List</h1>
      <p className="text-base text-gray-500 mb-8">Manage and track all your job posting here</p>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Company Name</th>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Industry</th>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Location</th>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Employment Range</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {companies.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No companies found
                </td>
              </tr>
            ) : (
              companies.map((company, idx) => (
                <tr
                  key={company._id}
                  className={idx % 2 === 0 ? 'bg-gray-50 cursor-pointer hover:bg-gray-100' : 'cursor-pointer hover:bg-gray-100'}
                  onClick={() => setSelectedCompany(company)}
                >
                  <td className="px-6 py-4 flex items-center gap-3 text-base font-medium text-gray-900">
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-semibold ${getInitialsBackgroundColor(company.name)}`}>
                      {getInitials(company.name)}
                    </div>
                    {company.name}
                  </td>
                  <td className="px-6 py-4 text-base text-gray-700">{company.domain || 'N/A'}</td>
                  <td className="px-6 py-4 text-base text-gray-700">{company.location || 'N/A'}</td>
                  <td className="px-6 py-4 text-base text-gray-700">{company.employeeNumber || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyList; 