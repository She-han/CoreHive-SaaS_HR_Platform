import React, { memo, useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SystemLoad = memo(() => {
  const [systemData, setSystemData] = useState([]);
  const [loading, setLoading] = useState(true);

  // localStorage එකෙන් ටෝකන් එක ලබා ගැනීම
  const token = localStorage.getItem("corehive_token");

  const fetchData = async () => {
    try {
      // Header එක සමඟ රික්වෙස්ට් එක යැවීම
      const response = await axios.get('http://localhost:8080/api/admin/system/stats-history', {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSystemData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from Spring Boot:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // සෑම තත්පර 10කට වරක් දත්ත අලුත් කිරීම
    const interval = setInterval(fetchData, 60000); 
    
    return () => clearInterval(interval); 
  }, [token]); // token එක වෙනස් වුවහොත් නැවත ක්‍රියාත්මක වේ

  return (
    <div style={{ 
      backgroundColor: 'white', padding: '20px', borderRadius: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', height: '100%'
    }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">System Load</h3>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>CPU and memory usage (Live)</p>
      
      <ResponsiveContainer width="100%" height={300}>
        {loading ? (
          <p className="flex items-center justify-center h-full">Loading System Stats...</p>
        ) : (
          <AreaChart data={systemData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#666' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#666' }}
              label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
            />
            <Tooltip formatter={(value) => [`${value}%`, '']} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="cpu" 
              name="CPU Usage" 
              stroke="#ff7300" 
              fill="#ff7300" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="memory" 
              name="Memory Usage" 
              stroke="#387908" 
              fill="#387908" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});

SystemLoad.displayName = 'SystemLoad';
export default SystemLoad;