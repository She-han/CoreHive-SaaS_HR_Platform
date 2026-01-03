import React from "react";
import Sidebar from "./Sidebar"
import {Outlet} from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

function MainHRLayout() {
  return (
    <DashboardLayout className="flex h-screen overflow-hidden">   {/* No scrolling */}
      

      {/* Main content area */}
      <div className="flex-1 bg-gray-50 min-h-screen">
        <Outlet />
      </div>
    </DashboardLayout>
  )
}

export default MainHRLayout