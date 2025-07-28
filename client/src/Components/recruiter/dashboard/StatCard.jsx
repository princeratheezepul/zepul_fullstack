import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ title, value, percentage, since }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-4xl font-bold text-black my-1">{value}</p>
          {/* <p className="text-sm text-gray-500">{since}</p> */}
        </div>
       
      </div>
    </div>
  );
};

export default StatCard; 