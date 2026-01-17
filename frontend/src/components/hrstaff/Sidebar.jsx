import { Link, NavLink } from "react-router-dom";
import {
  Users,
  Calendar,
  Clock,
  BarChart3,
  MessageSquare,
  Briefcase,
  Bell
} from "lucide-react"; // ✅ importing icons

export default function Sidebar() {
  return (
    <div className="bg-[#0C397A] text-white w-64 p-5 hidden md:block"> 
      {/* Header */}
      <div className="flex flex-col items-center mb-10"> 
        <div className="w-16 h-16 bg-blue-300 rounded-full mb-3"></div> {/* The circle’s width and height are 4rem each. */}
        <Link to="/hr_staff/Dashboard"><h2 className="text-xl font-semibold">HR Panel</h2></Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-2"> {/* Adds vertical space (0.5rem) between each link */}
        {/* Employee Management */}
        <NavLink
          to="/hr_staff/EmployeeManagement"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"
            }`
          }
        >
          <Users className="w-5 h-5" />
          Employee Management
        </NavLink>

        {/* Leave Management */}
        <NavLink
          to="/hr_staff/LeaveManagement"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"
            }`
          }
        >
          <Calendar className="w-5 h-5" />
          Leave Management
        </NavLink>

        {/* Attendance Management */}
        <NavLink
          to="/hr_staff/AttendanceManagement"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"
            }`
          }
        >
          <Clock className="w-5 h-5" />
          Attendance Management
        </NavLink>

        {/* HR Reporting */}
        <NavLink
          to="/hr_staff/HRReportingManagement"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"
            }`
          }
        >
          <BarChart3 className="w-5 h-5" />
          HR Reporting
        </NavLink>

        {/* Notice Management */}
        <NavLink
          to="/hr_staff/NoticeManagement"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"
            }`
          }
        >
          <Bell className="w-5 h-5" />
          Notice Management
        </NavLink>


        {/* Employee Feedback */}
        <NavLink
          to="/hr_staff/FeedBackManagement"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"
            }`
          }
        >
          <MessageSquare className="w-5 h-5" />
          Employee Feedback
        </NavLink>

        {/* Hiring Management */}
        <NavLink
          to="/hr_staff/HiringManagement"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-[#05668D]" : "hover:bg-[#1ED292]"
            }`
          }
        >
          <Briefcase className="w-5 h-5" />
          Hiring Management
        </NavLink>
      </nav>
    </div>
  );
}
