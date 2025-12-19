import React from 'react';
import StatsCard from '../../components/hrstaff/StatCard.jsx';
import { Users, UserCheck, UserX, ArrowRight, Zap, TrendingUp, PieChart, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

function HRDashboard() {
  return (
    <div className="min-h-screen bg-[#F1FDF9] font-sans text-[#333333] antialiased">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* REFINED PROFESSIONAL HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0C397A] tracking-tight md:text-4xl">
              Dashboard <span className="text-[#9B9B9B] font-light">|</span> <span className="text-[#02C39A]">CoreHive</span>
            </h1>
            <p className="text-[#9B9B9B] font-medium mt-1 uppercase text-xs tracking-[0.2em]">
              Human Resources Management System
            </p>
          </div>
          
          <Link 
            to="/hr_staff/employeemanagement" 
            className="group flex items-center gap-3 px-8 py-3.5 bg-[#0C397A] text-white font-bold rounded-full hover:bg-[#05668D] transition-all duration-300 shadow-xl shadow-[#0C397A]/20"
          >
            Manage Workforce 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ANALYTICS STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatsCard
            title="Total Workforce"
            value="120"
            icon={<Users size={22} />}
            color="#0C397A"
            trend="+3.2% growth"
          />
          <StatsCard
            title="Active Personnel"
            value="95"
            icon={<UserCheck size={22} />}
            color="#05668D"
            trend="Current Headcount"
          />
          <StatsCard
            title="Inactive / On Leave"
            value="25"
            icon={<UserX size={22} />}
            color="#1ED292"
            trend="5 Pending Actions"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* QUICK OPERATIONS - 7 Columns */}
          <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/50">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
              <h3 className="text-lg font-bold text-[#0C397A] flex items-center gap-3">
                <Zap size={20} className="text-[#02C39A]" /> Essential Operations
              </h3>
              <span className="text-[10px] text-[#9B9B9B] font-bold uppercase tracking-widest">Instant Access</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Leave Requests', count: '12', color: '#0C397A', sub: 'Pending Review' },
                { label: 'Payroll Status', count: 'Finalized', color: '#02C39A', sub: 'Dec 2025' },
                { label: 'Performance', count: '88%', color: '#05668D', sub: 'Avg Score' },
                { label: 'Feedback', count: '05', color: '#1ED292', sub: 'Unread' },
                { label: 'Departments', count: '08', color: '#9B9B9B', sub: 'Functional' },
                { label: 'Reports', count: 'Export', color: '#333333', sub: 'Data Analytics' }
              ].map((item) => (
                <button key={item.label} className="flex flex-col items-start p-5 rounded-2xl bg-[#F1FDF9]/30 border border-transparent hover:border-[#02C39A] hover:bg-white hover:shadow-lg transition-all group text-left">
                  <span className="text-[9px] font-black uppercase text-[#9B9B9B] group-hover:text-[#02C39A] mb-1">{item.label}</span>
                  <span className="text-xl font-bold text-[#0C397A]">{item.count}</span>
                  <span className="text-[10px] text-[#9B9B9B] mt-1 italic">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVITY FEED - 4 Columns */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/50">
            <h3 className="text-lg font-bold text-[#0C397A] mb-8 flex items-center gap-3">
               <TrendingUp size={20} className="text-[#05668D]" /> Audit Log
            </h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-px before:bg-gray-100">
              {[
                { user: 'Sahan Fernando', action: 'New Hire Onboarded', time: '2h ago', icon: <Users size={12}/>, color: '#02C39A' },
                { user: 'Eleanor Pena', action: 'Leave Approval', time: '5h ago', icon: <Briefcase size={12}/>, color: '#05668D' },
                { user: 'Payroll System', action: 'Stubs Generated', time: 'Yesterday', icon: <Zap size={12}/>, color: '#0C397A' }
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-5 items-start relative z-10">
                  <div className="p-2 rounded-full bg-white border border-gray-100 text-gray-400 shadow-sm" style={{ color: activity.color }}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#333333] leading-none">{activity.user}</p>
                    <p className="text-xs text-[#9B9B9B] mt-1">{activity.action}</p>
                    <span className="inline-block text-[9px] font-bold text-[#02C39A] bg-[#F1FDF9] px-2 py-0.5 rounded mt-2">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HRDashboard;