import React, { useState, useEffect } from 'react';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';

const AverageScore = () => {
  const { get } = useApi();
  const [scoreData, setScoreData] = useState({
    totalScore: 0,
    totalTotalScore: 0,
    averageScore: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAverageScoreData();
  }, []);

  const fetchAverageScoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await get(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/stats/average-score`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch average score data');
      }

      const result = await response.json();
      
      if (result.success) {
        setScoreData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching average score data:', err);
      setError(err.message);
      // Set default values on error
      setScoreData({
        totalScore: 0,
        totalTotalScore: 0,
        averageScore: 0,
        percentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const percentage = scoreData.percentage || 0;
  const data = [{ name: 'score', value: percentage }];
  const endAngle = 45 - (percentage / 100) * 360;

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col h-full">
        <div className="text-lg sm:text-xl font-semibold text-gray-800">Average Score</div>
        <div className="flex-grow flex items-center justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col h-full">
        <div className="text-lg sm:text-xl font-semibold text-gray-800">Average Score</div>
        <div className="flex-grow flex items-center justify-center my-4">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading data</p>
            <button 
              onClick={fetchAverageScoreData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="text-lg sm:text-xl font-semibold text-gray-800">Average Score</div>
      
      <div className="flex-grow flex items-center justify-center my-4">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: 100 }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="80%"
                outerRadius="100%"
                startAngle={45}
                endAngle={-315}
                fill="#E5E7EB"
                stroke="none"
              />
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="80%"
                outerRadius="100%"
                startAngle={45}
                endAngle={endAngle}
                fill="#2563EB" 
                stroke="none"
                cornerRadius={40}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-gray-900">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end text-center sm:text-left mt-2 sm:mt-4">
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0 max-w-[200px]">
          Reflects average score across submitted candidates
        </p>
        <span className="bg-gray-900 text-white text-xs font-semibold py-1 px-3 rounded-md">
          Score: {scoreData.totalScore}/{scoreData.totalTotalScore}
        </span>
      </div>
    </div>
  );
};

export default AverageScore;