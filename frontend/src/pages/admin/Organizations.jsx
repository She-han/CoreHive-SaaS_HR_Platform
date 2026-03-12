import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import OrganizationList from "./ui/OrganizationList";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getPlatformStatistics, getPendingApprovals } from "../../api/adminApi";
import {
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Shield
} from "lucide-react";

const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B"
};

const Organizations = () => {
  const user = useSelector(selectUser);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [stats, setStats] = useState({
    activeOrganizations: 0,
    pendingOrganizations: 0,
    dormantOrganizations: 0,
    suspendedOrganizations: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const [statsResponse, approvalsResponse] = await Promise.all([
        getPlatformStatistics(),
        getPendingApprovals()
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (approvalsResponse.success) {
        setPendingApprovals(approvalsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setLastRefresh(new Date());
    loadStats();
    setTimeout(() => setIsLoading(false), 500);
  }, [loadStats]);

  const formattedLastRefresh = useMemo(
    () =>
      lastRefresh.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
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
                    color: THEME.muted
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
                    color: "white"
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

          {/* Organization Status Overview */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold" style={{ color: THEME.dark }}>
                  Organization Status Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#ECFDF5" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Active
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.activeOrganizations || 0}
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#FFFBEB" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700">
                        Pending
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">
                      {pendingApprovals.length}
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#F3F4F6" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Dormant
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">
                      {stats.dormantOrganizations || 0}
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#FEF2F2" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        Suspended
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.suspendedOrganizations || 0}
                    </p>
                  </div>
                </div>
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
