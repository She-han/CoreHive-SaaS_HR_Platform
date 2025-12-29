import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BriefcaseIcon,
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
import * as designationApi from '../../api/designationApi';
import DashboardLayout from '../../components/layout/DashboardLayout';

export const DesignationManagement = () => {
  const [loading, setLoading] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', isActive: true });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const response = await designationApi.getAllDesignations();
      if (response.success) {
        setDesignations(response.data);
      }
    } catch (error) {
      showAlert('error', 'Failed to fetch designations');
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
      errors.name = 'Designation name is required';
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
        await designationApi.updateDesignation(selectedDesignation.id, formData);
        showAlert('success', 'Designation updated successfully');
      } else {
        await designationApi.createDesignation(formData);
        showAlert('success', 'Designation created successfully');
      }
      setIsModalOpen(false);
      fetchDesignations();
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
      await designationApi.deleteDesignation(selectedDesignation.id);
      showAlert('success', 'Designation deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedDesignation(null);
      fetchDesignations();
    } catch (error) {
      showAlert('error', 'Failed to delete designation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', isActive: true });
    setFormErrors({});
    setSelectedDesignation(null);
    setIsEditing(false);
  };

  const openEditModal = (designation) => {
    setSelectedDesignation(designation);
    setFormData({ 
      name: designation.name,
      isActive: designation.isActive !== undefined ? designation.isActive : true 
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openViewModal = (designation) => {
    setSelectedDesignation(designation);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (designation) => {
    setSelectedDesignation(designation);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = async () => {
    await fetchDesignations();
  };

  // Filter designations based on search and status
  const filteredDesignations = designations.filter(designation => {
    const matchesSearch = 
      designation.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && designation.isActive) ||
      (filterStatus === 'inactive' && !designation.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className='p-4'>
        {/* Header */}
        <div className="flex flex-col sm:flex-row p-6 justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Designation Management</h1>
            <p className="text-gray-600 mt-1">Manage job titles and designations</p>
          </div>
          <Button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Designation
          </Button>
        </div>

        {/* Alert */}
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            isOpen={alert.show}
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
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
         
          </div>
        </Card>

        {/* Designations Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Created At</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : filteredDesignations.length > 0 ? (
                  filteredDesignations.map((designation) => (
                    <tr key={designation.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{designation.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {designation.createdAt 
                            ? new Date(designation.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openViewModal(designation)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(designation)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(designation)}
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
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      No designations found
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
          title={isEditing ? "Edit Designation" : "Add New Designation"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Designation Name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              error={formErrors.name}
              required 
              icon={BriefcaseIcon}
              placeholder="e.g., Senior Software Engineer"
            />
            

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Designation' : 'Add Designation')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedDesignation(null); }}
          title="Designation Details"
          size="md"
        >
          {selectedDesignation && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <BriefcaseIcon className="w-10 h-10 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedDesignation.name}</h3>
                    <p className="text-sm text-gray-500">Job Title</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation Name</label>
                    <p className="text-gray-900">{selectedDesignation.name}</p>
                  </div>
           
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-gray-900">
                      {selectedDesignation.createdAt 
                        ? new Date(selectedDesignation.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => { setIsViewModalOpen(false); setSelectedDesignation(null); }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedDesignation);
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
          onClose={() => { setIsDeleteModalOpen(false); setSelectedDesignation(null); }} 
          title="Delete Designation"
        >
          {selectedDesignation && (
            <div className="space-y-4">
              <p className="text-gray-900">
                Are you sure you want to delete <strong>{selectedDesignation.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsDeleteModalOpen(false); setSelectedDesignation(null); }}
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

