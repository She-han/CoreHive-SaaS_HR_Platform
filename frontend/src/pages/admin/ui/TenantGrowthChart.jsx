import React, { memo, useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const TenantGrowthChart = memo(() => {
    
    const [growthData, setGrowthData] = useState([]);
    const [loading, setLoading] = useState(true);

    
    const token = localStorage.getItem("corehive_token");

    useEffect(() => {
        const fetchGrowthData = async () => {
            try {
                
                const response = await axios.get('http://localhost:8080/api/admin/tenant-growth', {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                
                setGrowthData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching growth data:", error);
                setLoading(false);
            }
        };

        if (token) {
            fetchGrowthData();
        }
    }, [token]);

    return (
        <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            height: '100%'
        }}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tenant Growth</h3>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>New tenants and active users over time</p>
            
            <ResponsiveContainer width="100%" height={300}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">Loading Chart Data...</div>
                ) : (
                    <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="month" // Backend DTO එකේ ඇති field name එක
                            tick={{ fill: '#666' }}
                            axisLine={{ stroke: '#ddd' }}
                        />
                        <YAxis 
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
                            type="natural" 
                            dataKey="newTenants" // Backend DTO field name 
                            name="New Tenants" 
                            stroke="#8884d8" 
                            strokeWidth={3}
                            dot={{ r: 4 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="activeUsers" // Backend DTO field name 
                            name="Active Users" 
                            stroke="#82ca9d" 
                            strokeWidth={3}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
});

TenantGrowthChart.displayName = 'TenantGrowthChart';
export default TenantGrowthChart;