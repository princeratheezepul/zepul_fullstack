import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LabelList, Tooltip } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';

const renderCustomizedLabel = (props) => {
    const { x, y, width, value, dataKey, payload, hoveredMonth } = props;
    
    if (!payload || payload.name !== hoveredMonth) {
      return null;
    }
  
    const isShortlist = dataKey === 'Shortlist';
  
    return (
      <g transform={`translate(${x + width / 2}, ${y})`}>
        <rect fill={isShortlist ? "#2563EB" : "#9CA3AF"} y={-22} x={-15} rx="10" width="30" height="20"></rect>
        <text y="-12" x="0" fill="white" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '10px', fontWeight: 'bold' }}>
          {value}
        </text>
      </g>
    );
};

const CustomBar = (props) => {
    const { fill, x, y, width, height, hovered } = props;
    const opacity = hovered ? 1 : 0.75;
    return <rect x={x} y={y} width={width} height={height} fill={fill} style={{ opacity }} />;
};

const CustomLegend = (props) => {
    const { payload } = props;
    if (!payload || !payload.length) {
      return null;
    }
    return (
      <div className="flex justify-end items-center space-x-4">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-500 text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
};

const CustomXAxisTick = ({ x, y, payload, hoveredMonth }) => {
    if (payload.value === hoveredMonth) {
      return (
        <g transform={`translate(${x - 15},${y + 4})`}>
            <rect x="0" y="0" width="30" height="20" fill="black" rx="10"></rect>
            <text x="15" y="10" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10">{payload.value}</text>
        </g>
      );
    }
  
    return (
        <text x={x} y={y} dy={16} textAnchor="middle" fill="#6B7280" fontSize={12}>
            {payload.value}
        </text>
    );
};

const ShortlistChart = () => {
    const { get } = useApi();
    const [hoveredMonth, setHoveredMonth] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchShortlistData();
    }, []);

    const fetchShortlistData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            console.log('userInfo from localStorage:', userInfo);
            console.log('Full userInfo structure:', JSON.stringify(userInfo, null, 2));
            
            // Use useApi hook for consistent authentication
            const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/stats/shortlist`);

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                throw new Error(`Failed to fetch shortlist data: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            console.log('Success response:', result);
            
            if (result.success) {
                setData(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch data');
            }
        } catch (err) {
            console.error('Error fetching shortlist data:', err);
            setError(err.message);
            // Fallback to empty data
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Candidate Shortlist VS Not Shortlist</h3>
                </div>
                <div className="flex-grow h-80 mt-4 flex items-center justify-center">
                    <div className="text-gray-500">Loading chart data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Candidate Shortlist VS Not Shortlist</h3>
                </div>
                <div className="flex-grow h-80 mt-4 flex items-center justify-center">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-start">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Candidate Shortlist VS Not Shortlist</h3>
                <Legend content={<CustomLegend />} verticalAlign="top" align="right" />
            </div>
            <div className="flex-grow h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 40,
                        right: 10,
                        left: -20,
                        bottom: 10,
                    }}
                    barCategoryGap="20%"
                    onMouseMove={(state) => {
                        if (state.isTooltipActive) {
                            setHoveredMonth(state.activeLabel);
                        }
                    }}
                    onMouseLeave={() => {
                        setHoveredMonth(null);
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={(props) => <CustomXAxisTick {...props} hoveredMonth={hoveredMonth} />}
                        height={30}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip cursor={false} content={<></>} />
                    
                    <Bar dataKey="Shortlist" fill="#2563EB" barSize={35} shape={(props) => <CustomBar {...props} hovered={hoveredMonth === props.payload.name} />}>
                        <LabelList dataKey="Shortlist" content={(props) => renderCustomizedLabel({ ...props, hoveredMonth })} />
                    </Bar>
                    <Bar dataKey="Not Shortlist" fill="#9CA3AF" barSize={35} shape={(props) => <CustomBar {...props} hovered={hoveredMonth === props.payload.name} />}>
                        <LabelList dataKey="Not Shortlist" content={(props) => renderCustomizedLabel({ ...props, hoveredMonth })} />
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ShortlistChart; 