import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ title, value, percentage, since }) => {
  return (
    <div className="bg-white p-2 md:p-3 rounded-lg shadow h-full">
      <div className="flex justify-between items-end h-full">
        <div>
          <p className="text-[10px] md:text-xs text-gray-500 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-black">{value}</p>
          {/* <p className="text-sm text-gray-500">{since}</p> */}
        </div>
       
      </div>
    </div>
  );
};

export default StatCard; 