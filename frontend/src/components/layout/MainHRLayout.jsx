import React from "react";
import Sidebar from "../hrstaff/Sidebar";
import {Outlet} from "react-router-dom";

function MainHRLayout() {
  return (
   <div className="flex h-screen overflow-hidden">   {/* No scrolling */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 bg-gray-50 min-h-screen p-6">
        <Outlet />
      </div>
    </div>
  )
}

export default MainHRLayout