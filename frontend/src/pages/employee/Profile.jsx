import React from "react";

export default function ProfilePage() {
  return (
    <div className="bg-gray-100 min-h-screen">

      {/* NAVBAR */}
      <nav className="w-full flex justify-between items-center px-10 py-4 bg-white shadow-sm">
        
        {/* Left */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Employee Portal</h1>
          <p className="text-sm text-gray-500">Welcome back, Sarah!</p>

          {/* Menu Tabs */}
          <div className="flex gap-6 mt-4 text-gray-600">
            <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium">
              Profile
            </button>
            <button className="hover:text-blue-600">Attendance</button>
            <button className="hover:text-blue-600">Leave</button>
            <button className="hover:text-blue-600">Payroll</button>
            <button className="hover:text-blue-600">Notifications</button>
            <button className="hover:text-blue-600">Surveys</button>
            <button className="hover:text-blue-600">Performance</button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-gray-800">Sarah Johnson</p>
            <p className="text-sm text-gray-500">Senior Software Engineer</p>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-400 text-white w-12 h-12 
                          rounded-full flex items-center justify-center font-semibold">
            SJ
          </div>
        </div>
      </nav>

      {/* MAIN PROFILE CARD */}
      <div className="px-10 mt-10">
        <div className="bg-white p-10 rounded-xl shadow w-full">

          <h2 className="text-xl font-semibold mb-8">My Profile</h2>

          <div className="flex gap-16">

            {/* LEFT SIDE */}
            <div className="w-1/4 text-center">
              <div className="bg-gradient-to-br from-blue-700 to-blue-400 text-white 
                              w-40 h-40 rounded-full flex items-center justify-center 
                              text-5xl font-semibold mx-auto">
                SJ
              </div>

              <h3 className="text-xl font-semibold mt-6">Sarah Johnson</h3>
              <p className="text-gray-500">Senior Software Engineer</p>
              <p className="text-gray-600 mt-2">ID: EMP001</p>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-3/4">

              {/* Contact Info */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>

                <div className="space-y-3 text-gray-700">
                  <p><strong>Email:</strong> sarah.johnson@company.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Location:</strong> New York, NY</p>
                </div>
              </div>

              <hr className="my-6" />

              {/* Employment Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Employment Information</h3>

                <div className="space-y-3 text-gray-700">
                  <p><strong>Department:</strong> Engineering</p>
                  <p><strong>Position:</strong> Senior Software Engineer</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
