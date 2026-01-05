import React from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'

const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

const Support = () => {
  return (
    <div>
       <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: THEME.dark }}
                >
                  Support Tickets  
                </h1>
                <p className="mt-1" style={{ color: THEME.muted }}>
                  Manage customer support requests and tickets
                </p>
              </div>
            </div>
          </div>
        </div>
        </DashboardLayout>
    </div>
  )
}

export default Support
