import { Users, Clock, Home, LogOut, Coffee, Calendar } from "lucide-react";

export default function SummaryCard({ title, value, statusKey }) {
  const colorMap = {
    PRESENT: { 
      bg: "#F1FDF9", text: "#02C39A", border: "#D1F5ED", 
      icon: <Users size={20} />, shadow: "rgba(2, 195, 154, 0.15)" 
    },
    ABSENT: { 
      bg: "#EEF2F7", text: "#0C397A", border: "#D1DCEB", 
      icon: <LogOut size={20} />, shadow: "rgba(12, 57, 122, 0.1)" 
    },
    LATE: { 
      bg: "#EBF6FA", text: "#05668D", border: "#D1E9F2", 
      icon: <Clock size={20} />, shadow: "rgba(5, 102, 141, 0.12)" 
    },
    HALF_DAY: { 
      bg: "#F4FEF9", text: "#1ED292", border: "#D9F7EB", 
      icon: <Coffee size={20} />, shadow: "rgba(30, 210, 146, 0.12)" 
    },
    ON_LEAVE: { 
      bg: "#F9F9F9", text: "#333333", border: "#EAEAEA", 
      icon: <Calendar size={20} />, shadow: "rgba(0, 0, 0, 0.05)" 
    },
    WORK_FROM_HOME: { 
      bg: "#F0F4F9", text: "#0C397A", border: "#DEE5EF", 
      icon: <Home size={20} />, shadow: "rgba(12, 57, 122, 0.1)" 
    },
  };

  const config = colorMap[statusKey] || colorMap.PRESENT;

  return (
    <div 
      className="relative p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-2 hover:-translate-y-1 group overflow-hidden"
      style={{ 
        backgroundColor: config.bg, 
        borderColor: config.border,
        boxShadow: `0 4px 20px -4px ${config.shadow}`
      }}
    >
      {/* Decorative Background Glow - Makes it pop */}
      <div 
        className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: config.text }}
      />

      <div className="flex justify-between items-start">
        <p 
          className="text-[10px] font-extrabold uppercase tracking-widest opacity-80"
          style={{ color: config.text }}
        >
          {title}
        </p>
        <div 
          className="p-1.5 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ color: config.text, backgroundColor: 'rgba(255,255,255,0.5)' }}
        >
          {config.icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <h2 
          className="text-4xl font-black tracking-tighter"
          style={{ color: config.text }}
        >
          {value}
        </h2>
        <span className="text-[10px] font-bold text-slate-400">MEMBERS</span>
      </div>

      {/* Progress Bar Decor - Purely Visual but Premium */}
      <div className="w-full h-1 bg-white/50 rounded-full mt-1 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 w-2/3" 
          style={{ backgroundColor: config.text, opacity: 0.4 }}
        />
      </div>
    </div>
  );
}