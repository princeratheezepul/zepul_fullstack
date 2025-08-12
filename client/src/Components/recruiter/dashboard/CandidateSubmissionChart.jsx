import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useApi } from '../../../hooks/useApi';

const CustomizedAxisTick = ({ x, y, payload, activeDataKey }) => {
  if (payload.value === activeDataKey) {
    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-25} y={5} width={50} height={25}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="bg-black text-white text-center rounded-full leading-6"
          >
            {payload.value}
          </div>
        </foreignObject>
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={15} dy={0} textAnchor="middle" fill="#6B7280" fontSize={14}>
        {payload.value}
      </text>
    </g>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload, activeDataKey } = props;
  if (payload.name === activeDataKey) {
    return (
      <foreignObject x={cx + 10} y={cy - 70} width="120" height="65">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-center"
        >
          <p className="text-blue-600 text-2xl font-bold">{payload.uv}</p>
        </div>
      </foreignObject>
    );
  }
  return null;
};

const CandidateSubmissionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDataKey, setActiveDataKey] = useState('');
  const { get } = useApi();

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/stats/monthly`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        // Set the first month as active by default
        if (result.data.length > 0) {
          setActiveDataKey(result.data[0].name);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError(err.message);
      // Fallback to empty data
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md px-4 md:px-8">
        <div className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Candidate Submission</div>
        <div className="flex items-center justify-center h-60 md:h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md px-4 md:px-8">
        <div className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Candidate Submission</div>
        <div className="flex items-center justify-center h-60 md:h-80">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading data</p>
            <button 
              onClick={fetchMonthlyData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate max value for Y-axis domain
  const maxValue = Math.max(...data.map(item => item.uv), 10); // Minimum of 10 for better visualization

  return (
    <div className="bg-white p-2 rounded-lg shadow-md h-full">
      <div className="text-xs md:text-sm font-bold text-gray-800 mb-1">Candidate Submission</div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: -20,
            bottom: 20,
          }}
          onMouseMove={(e) => {
            if (e.activeLabel) {
              setActiveDataKey(e.activeLabel);
            }
          }}
          onMouseLeave={() => {
            if (data.length > 0) {
              setActiveDataKey(data[0].name);
            }
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={<CustomizedAxisTick activeDataKey={activeDataKey} />}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, maxValue]}
            tick={{ fill: '#6B7280', fontSize: 14 }}
          />
          <Area
            type="monotone"
            dataKey="uv"
            stroke="#3B82F6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#chartGradient)"
            dot={<CustomDot activeDataKey={activeDataKey} />}
            activeDot={false}
          />
          {activeDataKey && <ReferenceLine x={activeDataKey} stroke="black" strokeWidth={2.5} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandidateSubmissionChart; 