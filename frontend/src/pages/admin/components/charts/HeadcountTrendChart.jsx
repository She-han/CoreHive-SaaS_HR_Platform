import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios'; 

const HeadcountTrendChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        
        axios.get('/api/admin/statistics/headcount-trend')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0C397A]">Headcount Trend</h3>
                <p className="text-sm text-gray-400">Employee growth over time</p>
            </div>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#02C39A" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#02C39A" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9B9B9B'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9B9B9B'}} />
                        <Tooltip />
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#02C39A" 
                            fillOpacity={1} 
                            fill="url(#colorCount)" 
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HeadcountTrendChart;