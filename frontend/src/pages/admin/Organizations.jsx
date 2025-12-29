import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const Organizations = () => {
  return (
    <div>
      <DashboardLayout title="System Administration">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Organization Management
                </h1>
                <p className="text-gray-500 pl-1 mt-2">
                  Manage all tenant organizations and their settings
                </p>
              </div>

              <div>
                <Button className="bg-teal-400 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                New Organization
              </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Organizations;
