import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import OrganizationList from "./ui/OrganizationList";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Clock,
  RefreshCw
} from "lucide-react";


const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

const Organizations = () => {
  const user = useSelector(selectUser);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setLastRefresh(new Date());
    // Trigger refresh in child components if needed
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const formattedLastRefresh = useMemo(
    () =>
      lastRefresh.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [lastRefresh]
  );

  return (
    <div>
      <DashboardLayout title="System Administration">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: THEME.dark }}
                >
                  Organization Management 
                </h1>
                <p className="mt-1" style={{ color: THEME.muted }}>
                  Manage all tenant organizations and their settings
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: THEME.background,
                    color: THEME.muted,
                  }}
                >
                  <Clock className="w-4 h-4" />
                  <span>Updated {formattedLastRefresh}</span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md disabled:opacity-50"
                  style={{
                    backgroundColor: THEME.primary,
                    color: "white",
                  }}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* organizations list */}
          <OrganizationList />
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Organizations;
