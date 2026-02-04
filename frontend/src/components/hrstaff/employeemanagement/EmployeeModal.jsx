// 📄 src/components/EmployeeModal.jsx
import React, { useState, useEffect } from "react";
import { User, Mail, Phone, CreditCard, DollarSign, Calendar, Building2, Award, IdCard, Clock, X } from "lucide-react";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8001";

export default function EmployeeModal({ employee, isOpen, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (employee && isOpen) {
      // Try to load face photo from AI service
      setImageLoading(true);
      const facePhotoUrl = `${AI_SERVICE_URL}/api/face/photo/${employee.organizationUuid}/${employee.id}`;
      
      // Check if photo exists
      fetch(facePhotoUrl)
        .then(response => {
          if (response.ok) {
            setImageUrl(facePhotoUrl);
          } else {
            setImageUrl(null);
          }
        })
        .catch(() => {
          setImageUrl(null);
        })
        .finally(() => {
          setImageLoading(false);
        });
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-[#0C397A] to-[#05668D] px-8 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              {imageLoading ? (
                <div className="w-24 h-24 rounded-2xl bg-white/20 animate-pulse flex items-center justify-center">
                  <User className="w-12 h-12 text-white/50" />
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
                  onError={() => setImageUrl(null)}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center text-4xl text-white font-bold border-4 border-white/30 shadow-lg">
                  {employee.firstName?.[0]}{employee.lastName?.[0]}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white shadow-md ${
                employee.isActive ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-white/90 font-medium mb-2">{employee.designation || "—"}</p>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                  {employee.employeeCode}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  employee.isActive 
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                    : 'bg-red-500/20 text-red-100 border border-red-400/30'
                }`}>
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
              
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.email || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.phone || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <IdCard className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">National ID</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.nationalId || "—"}</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Employment Details</h3>
              
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Department</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.departmentDTO?.name || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <Award className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Designation</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.designation || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Date Joined</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.dateOfJoining || "Not Available"}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Financial Information</h3>
              
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Basic Salary</p>
                  <p className="text-sm font-semibold text-gray-800">
                    Rs. {employee.basicSalary?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                  <CreditCard className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Salary Type</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.salaryType || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Leave Balance</p>
                  <p className="text-sm font-semibold text-gray-800">{employee.leaveCount || 0} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
