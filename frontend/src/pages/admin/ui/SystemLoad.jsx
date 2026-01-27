import React, { memo, useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SystemLoad = memo(() => {
  // 1. දත්ත තබා ගැනීමට State එකක් සාදාගන්න
  const [systemData, setSystemData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. API එකෙන් දත්ත ලබාගන්නා Function එක
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/system/stats-history');
      setSystemData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from Spring Boot:", error);
      setLoading(false);
    }
  };

  // 3. Component එක Load වන විට සහ වරින් වර දත්ත ලබාගැනීම
  useEffect(() => {
    fetchData(); // මුලින්ම දත්ත ගන්න

    // සෑම තත්පර 10කට වරක් Graph එක Update කරන්න (Scheduler එකේ වෙලාවට අනුව)
    const interval = setInterval(fetchData, 10000); 
    
    return () => clearInterval(interval); // Component එක අයින් කරන විට මෙය නවත්වන්න
  }, []);

  return (
    <div style={{ 
      backgroundColor: 'white', padding: '20px', borderRadius: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', height: '100%'
    }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">System Load</h3>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>CPU and memory usage (Live)</p>
      
      <ResponsiveContainer width="100%" height={300}>
        {loading ? (
          <p>Loading System Stats...</p>
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
            {/* CPU Usage Area */}
            <Area 
              type="monotone" 
              dataKey="cpu" 
              name="CPU Usage" 
              stroke="#ff7300" 
              fill="#ff7300" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {/* Memory Usage Area */}
            <Area 
              type="monotone" 
              dataKey="memory" 
              name="Memory Usage" 
              stroke="#387908" 
              fill="#387908" 
              fillOpacity={0.2}
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