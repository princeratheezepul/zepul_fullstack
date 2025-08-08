import React from 'react';

const Header = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-0">DASHBOARD</p>
        <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 -mt-1">Recruiter Overview</div>
      </div>

    </div>
  );
};

export default Header; 