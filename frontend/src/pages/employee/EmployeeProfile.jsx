import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function EmployeeProfile() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">

        {/* PAGE HEADER */}
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
          My Profile
        </h1>

        {/* BASIC PROFILE + CONTACT INFO */}
        <div
          className="
            bg-[var(--color-background-white)]
            rounded-xl p-6
            shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)]
            border border-[#f1f5f9]
            animate-slide-up
          "
        >
          <div className="flex flex-col md:flex-row gap-10">

            {/* LEFT */}
            <div className="md:w-1/4 text-center">
              <div className="bg-gradient-to-br from-blue-700 to-blue-400 text-white
                              w-36 h-36 rounded-full flex items-center justify-center
                              text-4xl font-semibold mx-auto">
                SJ
              </div>

              <h3 className="text-xl font-semibold mt-6">Sarah Johnson</h3>
              <p className="text-gray-500">Senior Software Engineer</p>
              <p className="text-gray-600 mt-2">ID: EMP001</p>
            </div>

            {/* RIGHT */}
            <div className="md:w-3/4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <p><strong>Email:</strong> sarah.johnson@company.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Location:</strong> New York, NY</p>
              </div>
            </div>
          </div>
        </div>

        {/* EMPLOYMENT INFORMATION (SEPARATE SECTION) */}
        <div
          className="
            bg-[var(--color-background-white)]
            rounded-xl p-6 mt-8
            shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)]
            border border-[#f1f5f9]
            animate-slide-up
          "
        >
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Employment Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Department:</strong> Engineering</p>
            <p><strong>Position:</strong> Senior Software Engineer</p>
            <p><strong>Date Joined:</strong> 02/05/2025</p>
            <p><strong>Basic Salary:</strong> Rs. 258,000</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
