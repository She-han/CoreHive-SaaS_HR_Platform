import React, { memo, useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SystemLoad = memo(() => {
  // දත්ත තබා ගැනීමට state එකක් හදන්න
  const [systemData, setSystemData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await axios.get('http://localhost:8080/api/system/stats-history');
        setSystemData(response.data);
      } catch (error) {
        console.error("Error fetching system stats:", error);
      }
    };

    fetchData();
    // this for get data every 5 minutes
    const interval = setInterval(fetchData, 300000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      backgroundColor: 'white', padding: '20px', borderRadius: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', height: '100%'
    }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">System Load</h3>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>CPU and memory usage over 24 hours</p>
      
      <ResponsiveContainer width="100%" height={300}>
        {/* show chart if data is available */}
        {systemData.length > 0 ? (
          <AreaChart data={systemData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
            <XAxis dataKey="time" tick={{ fill: '#666' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#666' }} />
            <Tooltip formatter={(value) => [`${value}%`, '']} />
            <Legend />
            <Area type="monotone" dataKey="cpu" name="CPU Usage" stroke="#ff7300" fill="#ff7300" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="memory" name="Memory Usage" stroke="#387908" fill="#387908" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        ) : (
          <p>Loading data...</p>
        )}
      </ResponsiveContainer>
    </div>
  );
});

SystemLoad.displayName = 'SystemLoad';
export default SystemLoad;