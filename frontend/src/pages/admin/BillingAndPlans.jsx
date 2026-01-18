import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle,
  DollarSign,
  Users,
  AlertCircle,
  Edit,
  Package
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import apiClient from '../../api/axios';
import { getActiveModules } from '../../api/extendedModulesApi';

const BillingAndPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [availableModules, setAvailableModules] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: '/month',
    description: '',
    employees: '',
    features: [],
    moduleIds: [],
    popular: false
  });
  const [featureInput, setFeatureInput] = useState('');
  const [editingFeatureIndex, setEditingFeatureIndex] = useState(null);
  const [editingFeatureText, setEditingFeatureText] = useState('');

  // Fetch plans and modules on component mount
  useEffect(() => {
    fetchPlans();
    fetchAvailableModules();
  }, []);

  const fetchAvailableModules = async () => {
    try {
      const response = await getActiveModules();
      if (response.success && Array.isArray(response.data)) {
        setAvailableModules(response.data);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/billing-plans');
      console.log('Fetch response:', response.status);
      setPlans(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        description: plan.description,
        employees: plan.employees,
        features: Array.isArray(plan.features) ? [...plan.features] : [],
        moduleIds: Array.isArray(plan.moduleIds) ? [...plan.moduleIds] : [],
        popular: plan.popular
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: '',
        period: '/month',
        description: '',
        employees: '',
        features: [],
        moduleIds: [],
        popular: false
      });
    }
    setFeatureInput('');
    setEditingFeatureIndex(null);
    setEditingFeatureText('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFeatureInput('');
    setEditingFeatureIndex(null);
    setEditingFeatureText('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleEditFeature = (index) => {
    setEditingFeatureIndex(index);
    setEditingFeatureText(formData.features[index]);
  };

  const handleSaveFeature = () => {
    if (editingFeatureText.trim() && editingFeatureIndex !== null) {
      setFormData(prev => ({
        ...prev,
        features: prev.features.map((feat, i) => 
          i === editingFeatureIndex ? editingFeatureText.trim() : feat
        )
      }));
      setEditingFeatureIndex(null);
      setEditingFeatureText('');
    }
  };

  const handleCancelEditFeature = () => {
    setEditingFeatureIndex(null);
    setEditingFeatureText('');
  };

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      moduleIds: prev.moduleIds.includes(moduleId)
        ? prev.moduleIds.filter(id => id !== moduleId)
        : [...prev.moduleIds, moduleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description || !formData.employees) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.features.length === 0) {
      setError('Please add at least one feature');
      return;
    }

    try {
      setError(null);
      
      console.log(`${editingPlan ? 'PUT' : 'POST'} request with data:`, formData);

      if (editingPlan) {
        await apiClient.put(`/billing-plans/${editingPlan.id}`, formData);
      } else {
        await apiClient.post('/billing-plans', formData);
      }
      
      await fetchPlans();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save plan');
      console.error('Error saving plan:', err);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      setError(null);
      await apiClient.delete(`/billing-plans/${id}`);
      await fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete plan');
      console.error('Error deleting plan:', err);
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F1FDF9] p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                Billing & Plans Management
              </h1>
              <p className="text-text-secondary">
                Manage and configure your pricing plans
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="primary"
                size="lg"
                icon={Plus}
                onClick={() => handleOpenModal()}
              >
                Add New Plan
              </Button>
            </motion.div>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          /* Plans Grid */
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className="transition-transform hover:-translate-y-2"
              >
                <Card
                  className={`relative h-full flex flex-col bg-white ${
                    plan.popular
                      ? 'ring-2 ring-[#02C39A] shadow-xl bg-gradient-to-br from-[#02C39A]/5 to-[#05668D]/5'
                      : 'shadow-lg'
                  } transition-all duration-300`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#02C39A] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6 pt-2">
                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-text-primary">
                        LKR {plan.price}
                      </span>
                      
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Users className="w-4 h-4" />
                      {plan.period}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-grow mb-6">
                    <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#1ED292]" />
                      Plan Features
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-[#1ED292] shrink-0 mt-0.5" />
                          <span className="text-text-primary text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Extended Modules Features */}
                    {plan.moduleIds && plan.moduleIds.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#02C39A]" />
                          Extended Modules ({plan.moduleIds.length})
                        </h4>
                        <div className="space-y-2.5">
                          {plan.moduleIds.map((moduleId, idx) => {
                            const module = availableModules.find(m => m.id === moduleId || m.moduleId === moduleId);
                            return module ? (
                              <div
                                key={idx}
                                className="flex items-start gap-2 bg-[#02C39A]/10 p-2 rounded-lg"
                              >
                                <Package className="w-4 h-4 text-[#02C39A] shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-text-primary text-sm font-semibold block">
                                    {module.name}
                                  </span>
                                  {module.description && (
                                    <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                                      {module.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#02C39A]/10 hover:bg-[#02C39A] text-[#02C39A] hover:text-white rounded-lg transition-colors duration-200 font-medium"
                      aria-label={`Edit ${plan.name} plan`}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors duration-200 font-medium"
                      aria-label={`Delete ${plan.name} plan`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#02C39A] to-[#05668D] text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingPlan ? `Edit ${editingPlan.name} Plan` : 'Create New Plan'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Plan Name */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Starter, Professional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Price (LKR) *
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 2,500 or Custom"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Billing Period
                    </label>
                    <input
                      type="text"
                      name="period"
                      value={formData.period}
                      onChange={handleInputChange}
                      placeholder="/month"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                    />
                  </div>

                  {/* Max Employees */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Employee Limit *
                    </label>
                    <input
                      type="text"
                      name="employees"
                      value={formData.employees}
                      onChange={handleInputChange}
                      placeholder="e.g., Up to 25 employees"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Plan description for customers"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Features *
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      placeholder="Add a feature and press Enter"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddFeature}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Add
                    </motion.button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {formData.features.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No features added yet</p>
                    ) : (
                      formData.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                        >
                          {editingFeatureIndex === index ? (
                            <>
                              <input
                                type="text"
                                value={editingFeatureText}
                                onChange={(e) => setEditingFeatureText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveFeature()}
                                className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSaveFeature}
                                className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded transition-colors"
                                title="Save"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCancelEditFeature}
                                className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 flex-1">
                                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                <span className="text-gray-900 text-sm">{feature}</span>
                              </div>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditFeature(index)}
                                className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveFeature(index)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Remove"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Module Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Included Modules
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Select which modules are included in this plan</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {availableModules.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 col-span-2">No modules available</p>
                    ) : (
                      availableModules.map((module) => (
                        <motion.label
                          key={module.moduleId}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.moduleIds.includes(module.moduleId)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.moduleIds.includes(module.moduleId)}
                            onChange={() => handleModuleToggle(module.moduleId)}
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{module.name}</p>
                            {module.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                            )}
                            {module.price > 0 && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">LKR {module.price}</p>
                            )}
                          </div>
                        </motion.label>
                      ))
                    )}
                  </div>
                </div>

                {/* Popular Checkbox */}
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-4">
                  <input
                    type="checkbox"
                    name="popular"
                    id="popular"
                    checked={formData.popular}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#02C39A] cursor-pointer"
                  />
                  <label htmlFor="popular" className="flex-1 cursor-pointer">
                    <p className="font-semibold text-text-primary">Mark as Most Popular</p>
                    <p className="text-sm text-text-secondary">
                      This plan will be highlighted on the pricing page
                    </p>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleCloseModal}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillingAndPlans;