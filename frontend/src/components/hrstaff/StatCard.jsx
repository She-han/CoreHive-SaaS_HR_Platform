import React from 'react';

const StatsCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-[#02C39A] transition-all duration-300 group overflow-hidden relative">
      {/* Decorative background element */}
      <div 
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" 
        style={{ backgroundColor: color }}
      />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <p className="text-[#9B9B9B] text-xs font-bold uppercase tracking-widest">
            {title}
          </p>
          <h2 className="text-4xl font-black text-[#333333]">
            {value}
          </h2>
          <div className="flex items-center gap-1">
             <span className="text-[10px] font-bold text-[#1ED292] bg-[#F1FDF9] px-2 py-0.5 rounded-full">
               {trend}
             </span>
          </div>
        </div>
        
        <div 
          className="p-4 rounded-xl shadow-inner group-hover:rotate-6 transition-transform duration-300"
          style={{ backgroundColor: `${color}10`, color: color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;