import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  DollarSign,
  Tag,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

import { 
  getAllModules, 
  createModule, 
  updateModule, 
  toggleModuleStatus,
  deleteModule 
} from '../../api/extendedModulesApi';

// Theme colors
const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
  background: '#F1FDF9',
  success: '#1ED292',
  text: '#333333',
  muted: '#9B9B9B'
};

// Module categories
const CATEGORIES = [
  'Attendance',
  'HR Management',
  'Performance',
  'Recruitment',
  'Analytics',
  'Other'
];

// Memoized Module Card
const ModuleCard = memo(({ module, onEdit, onToggle, onDelete }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggle(module.moduleId);
    setIsToggling(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: module.isActive ? `${THEME.primary}15` : '#F3F4F6' 
              }}
            >
              <Package 
                className="w-6 h-6" 
                style={{ color: module.isActive ? THEME.primary : THEME.muted }} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: THEME.dark }}>
                {module.name}
              </h3>
              {module.category && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  {module.category}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {module.isActive ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4" style={{ color: THEME.muted }}>
          {module.description || 'No description provided'}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <DollarSign className="w-4 h-4" style={{ color: THEME.secondary }} />
          <span className="font-bold text-lg" style={{ color: THEME.dark }}>
            ${module.price}
          </span>
          <span className="text-sm" style={{ color: THEME.muted }}>/month</span>
        </div>

        {/* Module Key */}
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <p className="text-xs font-mono text-gray-600">{module.moduleKey}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(module)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            style={{ color: THEME.dark }}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            style={{ 
              backgroundColor: module.isActive ? '#FEF2F2' : `${THEME.primary}15`,
              color: module.isActive ? '#DC2626' : THEME.primary,
              border: `1px solid ${module.isActive ? '#FCA5A5' : THEME.primary}`
            }}
          >
            {isToggling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            {module.isActive ? 'Deactivate' : 'Activate'}
          </button>
          
          <button
            onClick={() => onDelete(module)}
            className="px-3 py-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});
ModuleCard.displayName = 'ModuleCard';

/**
 * Modules Management Page (System Admin)
 * Manage extended modules - activate/deactivate, create, edit, delete
 */
const Modules = () => {
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [deleteConfirmModule, setDeleteConfirmModule] = useState(null);
  
  // Alert state
  const [alert, setAlert] = useState({ type: '', message: '', isOpen: false });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isActive: true,
    moduleKey: '',
    icon: '',
    category: 'Other'
  });
  const [formErrors, setFormErrors] = useState({});

  // Load modules
  const loadModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllModules();
      if (response.success) {
        setModules(response.data || []);
        setFilteredModules(response.data || []);
      } else {
        showAlert('error', 'Failed to load modules');
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      showAlert('error', 'Error loading modules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  // Filter modules
  useEffect(() => {
    let filtered = modules;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(module =>
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.moduleKey.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(module => module.category === filterCategory);
    }

    // Status filter
    if (filterStatus === 'Active') {
      filtered = filtered.filter(module => module.isActive);
    } else if (filterStatus === 'Inactive') {
      filtered = filtered.filter(module => !module.isActive);
    }

    setFilteredModules(filtered);
  }, [modules, searchQuery, filterCategory, filterStatus]);

  // Show alert
  const showAlert = (type, message) => {
    setAlert({ type, message, isOpen: true });
    setTimeout(() => setAlert({ type: '', message: '', isOpen: false }), 5000);
  };

  // Open create/edit modal
  const openModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name,
        description: module.description || '',
        price: module.price,
        isActive: module.isActive,
        moduleKey: module.moduleKey,
        icon: module.icon || '',
        category: module.category || 'Other'
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        isActive: true,
        moduleKey: '',
        icon: '',
        category: 'Other'
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingModule(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      isActive: true,
      moduleKey: '',
      icon: '',
      category: 'Other'
    });
    setFormErrors({});
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Module name is required';
    }
    
    if (!formData.moduleKey.trim()) {
      errors.moduleKey = 'Module key is required';
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.price = 'Valid price is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const moduleData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      let response;
      if (editingModule) {
        response = await updateModule(editingModule.moduleId, moduleData);
      } else {
        response = await createModule(moduleData);
      }

      if (response.success) {
        showAlert('success', editingModule ? 'Module updated successfully' : 'Module created successfully');
        closeModal();
        loadModules();
      } else {
        showAlert('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving module:', error);
      showAlert('error', 'Error saving module');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle module status
  const handleToggleStatus = async (moduleId) => {
    try {
      const response = await toggleModuleStatus(moduleId);
      if (response.success) {
        showAlert('success', 'Module status updated');
        loadModules();
      } else {
        showAlert('error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showAlert('error', 'Error updating status');
    }
  };

  // Delete module
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModule) return;

    setIsLoading(true);
    try {
      const response = await deleteModule(deleteConfirmModule.moduleId);
      if (response.success) {
        showAlert('success', 'Module deleted successfully');
        setDeleteConfirmModule(null);
        loadModules();
      } else {
        showAlert('error', 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      showAlert('error', 'Error deleting module');
    } finally {
      setIsLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: modules.length,
    active: modules.filter(m => m.isActive).length,
    inactive: modules.filter(m => !m.isActive).length
  };

  if (isLoading && modules.length === 0) {
    return (
      <DashboardLayout title="Module Management">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" text="Loading modules..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Module Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert */}
        {alert.isOpen && (
          <Alert
            type={alert.type}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
            className="mb-6"
          />
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
                Extended Modules Management
              </h1>
              <p className="mt-1" style={{ color: THEME.muted }}>
                Manage modules available to organizations
              </p>
            </div>
            
            <Button
              onClick={() => openModal()}
              variant="primary"
              icon={Plus}
              iconPosition="left"
            >
              Add New Module
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${THEME.primary}15` }}>
                <Package className="w-5 h-5" style={{ color: THEME.primary }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: THEME.muted }}>Total Modules</p>
                <p className="text-2xl font-bold" style={{ color: THEME.dark }}>{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm" style={{ color: THEME.muted }}>Active Modules</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                <XCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm" style={{ color: THEME.muted }}>Inactive Modules</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Power className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: THEME.dark }}>
              No modules found
            </h3>
            <p style={{ color: THEME.muted }}>
              {searchQuery || filterCategory !== 'All' || filterStatus !== 'All'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first module'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map(module => (
              <ModuleCard
                key={module.moduleId}
                module={module}
                onEdit={openModal}
                onToggle={handleToggleStatus}
                onDelete={setDeleteConfirmModule}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingModule ? 'Edit Module' : 'Create New Module'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Module Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., QR Attendance Marking"
              error={formErrors.name}
              required
            />

            <Input
              label="Module Key"
              name="moduleKey"
              value={formData.moduleKey}
              onChange={handleFormChange}
              placeholder="e.g., moduleQrAttendanceMarking"
              error={formErrors.moduleKey}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Module description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price (USD/month)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="0.00"
              error={formErrors.price}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Icon (optional)"
            name="icon"
            value={formData.icon}
            onChange={handleFormChange}
            placeholder="e.g., QrCode"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleFormChange}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Module is active (visible to organizations)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              {editingModule ? 'Update Module' : 'Create Module'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmModule}
        onClose={() => setDeleteConfirmModule(null)}
        title="Delete Module"
      >
        <div className="space-y-4">
          <p style={{ color: THEME.text }}>
            Are you sure you want to delete <strong>{deleteConfirmModule?.name}</strong>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmModule(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              loading={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Module
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Modules;
