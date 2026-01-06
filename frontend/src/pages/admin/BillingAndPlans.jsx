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
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const BillingAndPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: '/month',
    description: '',
    employees: '',
    features: [],
    popular: false
  });
  const [featureInput, setFeatureInput] = useState('');

  // Backend API URL
  const API_BASE_URL = 'http://localhost:8080';

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/billing-plans`);
      console.log('Fetch response status:', response.status);
      if (!response.ok) throw new Error(`Failed to fetch plans: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err.message);
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
        features: [...plan.features],
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
        popular: false
      });
    }
    setFeatureInput('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFeatureInput('');
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
      const url = editingPlan ? `${API_BASE_URL}/api/billing-plans/${editingPlan.id}` : `${API_BASE_URL}/api/billing-plans`;
      const method = editingPlan ? 'PUT' : 'POST';

      console.log(`${method} request to:`, url);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save plan: ${response.status} - ${errorText}`);
      }
      
      await fetchPlans();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
      console.error('Error saving plan:', err);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      setError(null);
      console.log(`DELETE request to: ${API_BASE_URL}/api/billing-plans/${id}`);
      const response = await fetch(`${API_BASE_URL}/api/billing-plans/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete plan: ${response.status} - ${errorText}`);
      }
      
      await fetchPlans();
    } catch (err) {
      setError(err.message);
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
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
          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-12"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                variants={fadeInUpVariants}
                whileHover={{ y: -8 }}
              >
                <Card
                  className={`relative h-full flex flex-col ${
                    plan.popular
                      ? 'ring-2 ring-[#02C39A] shadow-xl bg-gradient-to-br from-[#02C39A]/5 to-[#05668D]/5'
                      : 'hover:shadow-lg'
                  } transition-all duration-300`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0, y: -10 }}
                      animate={{ scale: 1, y: 0 }}
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    >
                      <span className="bg-[#02C39A] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </motion.div>
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
                      <span className="text-text-secondary text-sm">
                        {plan.period}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Users className="w-4 h-4" />
                      {plan.employees}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-grow mb-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="w-5 h-5 text-[#1ED292] flex-shrink-0 mt-0.5" />
                          <span className="text-text-primary text-sm">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenModal(plan)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#02C39A]/10 hover:bg-[#02C39A] text-[#02C39A] hover:text-white rounded-lg transition-colors duration-200 font-medium"
                      aria-label={`Edit ${plan.name} plan`}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors duration-200 font-medium"
                      aria-label={`Delete ${plan.name} plan`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal */}
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#02C39A] to-[#05668D] text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingPlan ? `Edit ${editingPlan.name} Plan` : 'Create New Plan'}
                </h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </motion.button>
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
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Features *
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      placeholder="Add a feature and press Enter"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAddFeature}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between bg-[#02C39A]/10 rounded-lg p-3"
                      >
                        <span className="text-text-primary text-sm">{feature}</span>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          aria-label={`Remove ${feature}`}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
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
                  <motion.div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleCloseModal}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillingAndPlans;