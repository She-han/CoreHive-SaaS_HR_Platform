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

const TenantGrowthChart = () => {
    const tenantData = [
        { month: 'Jan', newTenants: 800, activeUsers: 1200 },
        { month: 'Feb', newTenants: 1100, activeUsers: 1500 },
        { month: 'Mar', newTenants: 1400, activeUsers: 1800 },
        { month: 'Apr', newTenants: 1700, activeUsers: 2100 },
        { month: 'May', newTenants: 2100, activeUsers: 2500 },
        { month: 'Jun', newTenants: 2400, activeUsers: 2900 },
    ];

    return (
      <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Tenant Growth</h3>
      <p style={{ marginBottom: '20px', color: '#666' }}>New tenants and active users over time</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={tenantData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#ddd' }}
          />
          <YAxis 
            domain={[0, 3200]}
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#ddd' }}
            label={{ 
              value: 'Count', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10,
              style: { fill: '#666' }
            }}
          />
          <Tooltip 
            formatter={(value) => [value, '']}
            labelStyle={{ color: '#333' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="newTenants" 
            name="New Tenants" 
            stroke="#8884d8" 
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="activeUsers" 
            name="Active Users" 
            stroke="#82ca9d" 
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TenantGrowthChart
