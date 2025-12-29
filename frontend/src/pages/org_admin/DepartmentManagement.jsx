import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import * as departmentApi from '../../api/departmentApi';
import DashboardLayout from '../../components/layout/DashboardLayout';

const DepartmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', code: '', isActive: true });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentApi.getAllDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      showAlert('error', 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) {
      errors.name = 'Department name is required';
    }
    if (!formData.code?.trim()) {
      errors.code = 'Department code is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (isEditing) {
        await departmentApi.updateDepartment(selectedDept.id, formData);
        showAlert('success', 'Department updated successfully');
      } else {
        await departmentApi.createDepartment(formData);
        showAlert('success', 'Department created successfully');
      }
      setIsModalOpen(false);
      fetchDepartments();
      resetForm();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await departmentApi.deleteDepartment(selectedDept.id);
      showAlert('success', 'Department deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedDept(null);
      fetchDepartments();
    } catch (error) {
      showAlert('error', 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', isActive: true });
    setFormErrors({});
    setSelectedDept(null);
    setIsEditing(false);
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setFormData({ 
      name: dept.name, 
      code: dept.code, 
      isActive: dept.isActive !== undefined ? dept.isActive : true 
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openViewModal = (dept) => {
    setSelectedDept(dept);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (dept) => {
    setSelectedDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = async () => {
    await fetchDepartments();
  };

  // Filter departments based on search and status
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && dept.isActive) ||
      (filterStatus === 'inactive' && !dept.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className='p-4'>
        {/* Header */}
        <div className="flex flex-col sm:flex-row p-6 justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600 mt-1">Manage organization departments</p>
          </div>
          <Button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Department
          </Button>
        </div>

        {/* Alert */}
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Departments Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{dept.code}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          dept.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openViewModal(dept)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(dept)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(dept)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add/Edit Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); resetForm(); }} 
          title={isEditing ? "Edit Department" : "Add New Department"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Department Name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              error={formErrors.name}
              required 
              icon={BuildingOfficeIcon}
              placeholder="e.g., Human Resources"
            />
            <Input 
              label="Department Code" 
              value={formData.code} 
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              error={formErrors.code}
              required 
              placeholder="e.g., HR, IT, FIN"
            />
            
            {/* Status Toggle - Only in Edit Mode */}
            {isEditing && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department Status</label>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.isActive ? 'This department is currently active' : 'This department is currently inactive'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Department' : 'Add Department')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedDept(null); }}
          title="Department Details"
          size="md"
        >
          {selectedDept && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <BuildingOfficeIcon className="w-10 h-10 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedDept.name}</h3>
                    <p className="text-sm text-gray-500">Code: {selectedDept.code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Name</label>
                    <p className="text-gray-900">{selectedDept.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Code</label>
                    <p className="text-gray-900">{selectedDept.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedDept.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-gray-900">
                      {selectedDept.createdAt 
                        ? new Date(selectedDept.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => { setIsViewModalOpen(false); setSelectedDept(null); }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedDept);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={isDeleteModalOpen} 
          onClose={() => { setIsDeleteModalOpen(false); setSelectedDept(null); }} 
          title="Delete Department"
        >
          {selectedDept && (
            <div className="space-y-4">
              <p className="text-gray-900">
                Are you sure you want to delete <strong>{selectedDept.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsDeleteModalOpen(false); setSelectedDept(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDelete} 
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DepartmentManagement;