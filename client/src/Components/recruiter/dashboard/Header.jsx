import React from 'react';

const Header = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <p className="text-sm font-medium text-gray-500">DASHBOARD</p>
        <div className="text-2xl sm:text-3xl font-bold text-gray-800">Recruiter Overview</div>
      </div>

    </div>
  );
};

export default Header; 