import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-[#0C397A] text-white w-64 p-5 hidden md:block">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-blue-300 rounded-full mb-3"></div>
        <h2 className="text-xl font-semibold">HR Panel</h2>
      </div>

      <nav className="space-y-2">
        <NavLink to="/" className={({ isActive }) => 
          `block p-2 rounded-lg ${isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"}`
        }>Employee Management</NavLink>

        <NavLink to="/leaves" className="block p-2 rounded-lg hover:bg-[#1ED292]">
          Leave Management
        </NavLink>
        <NavLink to="/attendance" className="block p-2 rounded-lg hover:bg-[#1ED292]">
          Attendance Management
        </NavLink>
        <NavLink to="/reports" className="block p-2 rounded-lg hover:bg-[#1ED292]">
          HR Reporting
        </NavLink>
        <NavLink to="/feedback" className="block p-2 rounded-lg hover:bg-[#1ED292]">
          Employee Feedback
        </NavLink>
        <NavLink to="/hiring" className="block p-2 rounded-lg hover:bg-[#1ED292]">
          Hiring Management
        </NavLink>
      </nav>
    </div>
  );
}
