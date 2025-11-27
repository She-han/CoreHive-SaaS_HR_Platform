import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon 
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
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', code: '' });
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
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      fetchDepartments();
    } catch (error) {
      showAlert('error', 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '' });
    setSelectedDept(null);
    setIsEditing(false);
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setFormData({ name: dept.name, code: dept.code });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage organization departments</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Department
        </Button>
      </div>

      {alert.show && <Alert type={alert.type} message={alert.message} />}

      <Card>
        {loading && !departments.length ? (
          <div className="p-8 text-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">Code</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{dept.code}</td>
                    <td className="p-4 font-medium">{dept.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openEditModal(dept)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setSelectedDept(dept); setIsDeleteModalOpen(true); }} className="text-red-600 hover:bg-red-50 p-1 rounded">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {departments.length === 0 && <div className="p-8 text-center text-gray-500">No departments found.</div>}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Department Name" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
            icon={BuildingOfficeIcon}
          />
          <Input 
            label="Department Code" 
            value={formData.code} 
            onChange={(e) => setFormData({...formData, code: e.target.value})} 
            required 
            placeholder="e.g., HR, IT"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Department">
        <p>Are you sure you want to delete <strong>{selectedDept?.name}</strong>?</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default DepartmentManagement;