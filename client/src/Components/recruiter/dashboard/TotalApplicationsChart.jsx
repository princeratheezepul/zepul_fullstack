import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';
import { getApiUrl, logConfig } from '../../../config/config.js';

const COLORS = ['#1E75FF', '#0F172A', '#F97316', '#64748B', '#FBBF24', '#F0F2F5'];

const TotalApplicationsChart = () => {
  const { user } = useAuth();
  const { get } = useApi();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default data if no props provided
  const defaultData = [
    { name: 'Engineering', value: 120 },
    { name: 'Marketing', value: 87 },
    { name: 'Sales', value: 87 },
    { name: 'Customer Support', value: 87 },
    { name: 'Finance', value: 87 },
    { name: 'Other', value: 55 },
  ];

  useEffect(() => {
    const fetchResumeStats = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching resume stats for user:', user.id);
        console.log('User type:', user.type);
        
        // Log configuration for debugging
        logConfig();
        
        // Use direct fetch for debugging
        const apiUrl = getApiUrl('/api/resumes/stats/recruiter');
        console.log('Using API URL:', apiUrl);
        
        // Log cookies for debugging
        console.log('Current cookies:', document.cookie);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          
          // Check if it's an HTML response (likely a 404 or error page)
          if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
            throw new Error(`Server returned HTML instead of JSON. This might be an authentication issue. Status: ${response.status}`);
          }
          
          // Try to parse as JSON if possible
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { message: `HTTP ${response.status}: ${errorText.substring(0, 100)}...` };
          }
          
          throw new Error(errorData.message || `Failed to fetch resume statistics: ${response.status}`);
        }

        const result = await response.json();
        console.log('API result:', result);
        
        // Use the real data from API
        setData(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        console.error('Error fetching resume statistics:', err);
        setError(err.message);
        // Fallback to default data on error
        setData(defaultData);
        setTotal(523);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeStats();
  }, [user?.id]); // Only depend on user.id, not get function

  const chartData = data.length > 0 ? data : defaultData;
  const chartTotal = total > 0 ? total : 523;
  // Show all fields in legend including "Other"
  const legendData = chartData;

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-md font-sans">
        <div className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Total Applications</div>
        <div className="flex items-center justify-center h-48 md:h-64">
          <div className="text-gray-500">Loading applications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-md font-sans">
        <div className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Total Applications</div>
        <div className="flex items-center justify-center h-48 md:h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-2 shadow-md font-sans h-full">
      <div className="text-xs md:text-sm font-semibold mb-1">Total Applications</div>
      <div className="flex items-center gap-2 h-[calc(100%-24px)]">
        <div className="relative w-full h-full max-w-[45%]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-3xl md:text-2xl lg:text-3xl font-bold leading-none">{chartTotal}</div>
            <div className="text-gray-500 text-sm md:text-xs lg:text-sm">Total Applications</div>
          </div>
        </div>
        <ul className="list-none p-0 m-0 flex flex-col gap-1 md:gap-2">
            {legendData.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="flex-grow text-xs text-gray-700 truncate">{entry.name}</span>
                    <span className="bg-gray-800 text-white py-0.5 px-1.5 rounded-xl text-[10px] font-medium min-w-[24px] text-center">{entry.value}</span>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default TotalApplicationsChart; 