import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const SystemLoad = () => {

const systemData = [
    { time: '00:00', cpu: 35, memory: 45 },
    { time: '04:00', cpu: 28, memory: 40 },
    { time: '08:00', cpu: 65, memory: 55 },
    { time: '12:00', cpu: 85, memory: 75 },
    { time: '16:00', cpu: 72, memory: 68 },
    { time: '20:00', cpu: 45, memory: 52 },
  ];

  return (
     <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">System Load</h3>
      <p style={{ marginBottom: '20px', color: '#666' }}>CPU and memory usage over 24 hours</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={systemData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea
" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#ddd' }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#ddd' }}
            label={{ 
              value: 'Usage (%)', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10,
              style: { fill: '#666' }
            }}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, '']}
            labelStyle={{ color: '#333' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="cpu" 
            name="CPU Usage" 
            stroke="#ff7300" 
            fill="#fff" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="memory" 
            name="Memory Usage" 
            stroke="#387908" 
            fill="#fff" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SystemLoad

  

