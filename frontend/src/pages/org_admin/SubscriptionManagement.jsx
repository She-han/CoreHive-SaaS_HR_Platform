import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Package,
  Check,
  Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';

import { selectUser } from '../../store/slices/authSlice';
import {
  getSubscriptionDetails,
  cancelSubscription,
  reactivateSubscription,
  changePlan
} from '../../api/subscriptionApi';
import { getAllBillingPlans } from '../../api/adminApi';
import { getActiveModules } from '../../api/extendedModulesApi';

const SubscriptionManagement = () => {
  const user = useSelector(selectUser);
  
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [billingPlans, setBillingPlans] = useState([]);
  const [extendedModules, setExtendedModules] = useState([]);
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customModules, setCustomModules] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Plan, 2: Select Modules (for Custom)
  const [customTotalPrice, setCustomTotalPrice] = useState(0);

  useEffect(() => {
    if (user?.organizationUuid) {
      loadData();
    }
  }, [user?.organizationUuid]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const detailsRes = await getSubscriptionDetails(user.organizationUuid);

      if (detailsRes.success) {
        setSubscriptionData(detailsRes.data);
      }
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const loadPlansAndModules = async () => {
    try {
      const [plansRes, modulesRes] = await Promise.all([
        getAllBillingPlans(),
        getActiveModules()
      ]);

      if (plansRes?.data) {
        setBillingPlans(plansRes.data);
      }

      if (modulesRes?.data) {
        setExtendedModules(modulesRes.data);
      }
    } catch (err) {
      console.error('Error loading plans and modules:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load billing plans. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    }
  };

  const handleShowPlanChange = async () => {
    if (!showPlanChange) {
      await loadPlansAndModules();
    }
    setShowPlanChange(!showPlanChange);
    setStep(1);
    setSelectedPlan(null);
    setCustomModules([]);
  };

  const handleCancelSubscription = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancel Subscription?',
      html: 'Are you sure you want to cancel your subscription?<br><span class="text-red-600 text-sm">You will lose access to all features at the end of your current billing period.</span>',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel It',
      cancelButtonText: 'No, Keep It',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#02C39A',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setProcessing(true);
      const response = await cancelSubscription(user.organizationUuid);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Subscription Cancelled',
          text: 'Your subscription has been cancelled successfully.',
          confirmButtonColor: '#02C39A'
        });
        loadData();
      } else {
        throw new Error(response.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: err.message || 'Failed to cancel subscription. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Reactivate Subscription?',
      text: 'Your subscription will be reactivated and auto-billing will continue from your next billing date.',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reactivate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#02C39A',
      cancelButtonColor: '#6B7280'
    });

    if (!result.isConfirmed) return;

    try {
      setProcessing(true);
      const response = await reactivateSubscription(user.organizationUuid);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Subscription Reactivated',
          text: 'Your subscription has been reactivated successfully.',
          confirmButtonColor: '#02C39A'
        });
        loadData();
      } else {
        throw new Error(response.message || 'Failed to reactivate subscription');
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      Swal.fire({
        icon: 'error',
        title: 'Reactivation Failed',
        text: err.message || 'Failed to reactivate subscription. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    
    // If Custom plan, move to module selection
    if (plan.name === 'Custom') {
      setStep(2);
      setCustomModules([]);
      // Initialize customTotalPrice with the base plan price (ensure it's a number)
      setCustomTotalPrice(Number(plan.price) || 0);
    } else {
      setStep(1);
      setCustomModules([]);
      setCustomTotalPrice(0);
    }
  };

  const handleModuleToggle = (moduleId) => {
    setCustomModules(prev => {
      const newModules = prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId];
      
      // Calculate total price: base Custom plan price + sum of selected module prices
      const basePrice = Number(selectedPlan?.price) || 0;
      const modulesPrice = newModules.reduce((sum, id) => {
        const module = extendedModules.find(m => m.moduleId === id);
        return sum + (Number(module?.price) || 0);
      }, 0);
      setCustomTotalPrice(basePrice + modulesPrice);
      
      return newModules;
    });
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      Swal.fire({
        icon: 'warning',
        title: 'No Plan Selected',
        text: 'Please select a plan to continue.',
        confirmButtonColor: '#02C39A'
      });
      return;
    }

    // For Custom plan, check if modules are selected
    if (selectedPlan.name === 'Custom' && customModules.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Modules Selected',
        text: 'Please select at least one module for your custom plan.',
        confirmButtonColor: '#02C39A'
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Plan Change',
      html: `
        <div class="text-left">
          <p class="mb-2">You are changing your plan to:</p>
          <p class="font-bold text-lg text-[#02C39A]">${selectedPlan.name}</p>
          ${selectedPlan.name === 'Custom' && customModules.length > 0 ? 
            `<p class="text-gray-600">Base Price: LKR ${Number(selectedPlan.price || 0).toFixed(2)} / month</p>
             <p class="text-gray-600">Modules Price: LKR ${(Number(customTotalPrice || 0) - Number(selectedPlan.price || 0)).toFixed(2)} / month</p>
             <p class="font-bold text-gray-800 mt-2">Total: LKR ${Number(customTotalPrice || 0).toFixed(2)} / month</p>
             <p class="mt-3 text-sm text-gray-600">${customModules.length} module(s) selected</p>` 
            : `<p class="text-gray-600">LKR ${selectedPlan.price} / month</p>`}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Change',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#02C39A',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setProcessing(true);
      
      // For Custom plan, pass the calculated total price
      const finalPrice = selectedPlan.name === 'Custom' && customModules.length > 0 
        ? customTotalPrice 
        : null; // null means use the plan's default price
      
      const response = await changePlan(user.organizationUuid, selectedPlan.id, customModules, finalPrice);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Plan Changed!',
          text: 'Your subscription plan has been updated successfully.',
          confirmButtonColor: '#02C39A'
        });
        setShowPlanChange(false);
        setStep(1);
        setSelectedPlan(null);
        setCustomModules([]);
        setCustomTotalPrice(0);
        loadData();
      } else {
        throw new Error(response.message || 'Failed to change plan');
      }
    } catch (err) {
      console.error('Error changing plan:', err);
      Swal.fire({
        icon: 'error',
        title: 'Plan Change Failed',
        text: err.message || 'Failed to change plan. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'TRIAL':
        return 'text-green-600 bg-green-100';
      case 'PAST_DUE':
        return 'text-yellow-600 bg-yellow-100';
      case 'CANCELED':
      case 'SUSPENDED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner centerScreen text="Loading subscription details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F1FDF9] to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Error Loading Data</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={loadData}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1FDF9] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
   
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                  Subscription Management
                </h1>
                <p className="text-text-secondary mt-1">
                  Manage your subscription, billing, and payment history
                </p>
              </div>
            </div>
          </div>
       

        {/* Current Plan Section */}
  
          <Card className="mb-6 shadow-sm">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-text-secondary mb-1">Current Plan</div>
                  <div className="text-3xl font-bold text-primary-600">
                    {subscriptionData?.subscription?.planName}
                  </div>
                  <div className="text-xl text-text-primary mt-2">
                    LKR {subscriptionData?.subscription?.planPrice} / month
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscriptionData?.subscription?.status)}`}>
                  {subscriptionData?.subscription?.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="text-xs text-text-secondary">Next Billing</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {subscriptionData?.subscription?.nextBillingDate ? 
                        new Date(subscriptionData.subscription.nextBillingDate).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {subscriptionData?.subscription?.isTrial && (
                  <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-xs text-text-secondary">Trial Ends</div>
                      <div className="text-sm font-semibold text-text-primary">
                        {new Date(subscriptionData.subscription.trialEndDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="text-xs text-text-secondary">Last Payment</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {subscriptionData?.subscription?.lastPaymentAmount 
                        ? `LKR ${subscriptionData.subscription.lastPaymentAmount}`
                        : 'No payment yet'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
   

        {/* Action Buttons */}

          <Card>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleShowPlanChange}
                icon={TrendingUp}
                disabled={processing || subscriptionData?.subscription?.status === 'CANCELED'}
              >
                {showPlanChange ? 'Hide Plans' : 'Change Plan'}
              </Button>
              {subscriptionData?.subscription?.status === 'CANCELED' ? (
                <Button
                  variant="primary"
                  onClick={handleReactivateSubscription}
                  disabled={processing}
                >
                  Reactivate Subscription
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={processing || subscriptionData?.subscription?.status === 'CANCELED'}
              >
                Cancel Subscription
              </Button>
            </div>
          </Card>


        {/* Plan Change Section */}
        {showPlanChange && (

            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                {step === 1 ? 'Select Your Plan' : 'Customize Your Plan'}
              </h3>

              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {billingPlans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan)}
                        className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                          selectedPlan?.id === plan.id
                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                            : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 right-4">
                            <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Popular
                            </span>
                          </div>
                        )}

                        <div className="text-xl font-bold text-text-primary mb-2">{plan.name}</div>
                        <div className="text-3xl font-bold text-primary-600 mb-2">
                          LKR {plan.price}
                        </div>
                        <div className="text-sm text-text-secondary mb-4">{plan.period}</div>
                        
                        {plan.description && (
                          <p className="text-sm text-text-secondary mb-4">{plan.description}</p>
                        )}

                        <div className="text-xs text-text-secondary mb-4">
                          Up to {plan.employees} employees
                        </div>

                        {plan.modules && plan.modules.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-xs font-semibold text-text-secondary mb-2">Included Modules:</div>
                            <div className="space-y-1">
                              {plan.modules.map((module, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-text-primary">
                                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span>{module.name || module}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedPlan?.id === plan.id && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedPlan && selectedPlan.name !== 'Custom' && (
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={handleChangePlan}
                        disabled={processing}
                        className="px-8"
                      >
                        {processing ? 'Processing...' : 'Confirm Plan Change'}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {step === 2 && selectedPlan?.name === 'Custom' && (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-text-secondary mb-4">
                      Select the modules you want to include in your custom plan:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {extendedModules.map((module) => (
                        <div
                          key={module.moduleId}
                          onClick={() => handleModuleToggle(module.moduleId)}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            customModules.includes(module.moduleId)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-text-primary mb-1">{module.name}</div>
                              <p className="text-sm text-text-secondary">{module.description}</p>
                              <p className="text-sm font-medium text-primary-600 mt-1">LKR {module.price} / month</p>
                            </div>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                              customModules.includes(module.moduleId)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-gray-300'
                            }`}>
                              {customModules.includes(module.moduleId) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Plan Price:</span>
                        <span className="font-medium">LKR {Number(selectedPlan.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Selected Modules:</span>
                        <span className="font-medium">LKR {(Number(customTotalPrice || 0) - Number(selectedPlan.price || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>Total Monthly Price:</span>
                        <span className="text-primary-600">LKR {Number(customTotalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={processing}
                    >
                      Back to Plans
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleChangePlan}
                      disabled={processing || customModules.length === 0}
                      className="px-8"
                    >
                      {processing ? 'Processing...' : `Confirm (${customModules.length} modules)`}
                    </Button>
                  </div>
                </>
              )}
            </Card>
       
        )}

        {/* Transaction History */}

          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Transaction History</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Order ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscriptionData?.transactions?.length > 0 ? (
                      subscriptionData.transactions.map((tx) => (
                        <tr key={tx.transactionUuid} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-text-primary">
                            {new Date(tx.transactionDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                            {tx.currency} {tx.amount}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {tx.transactionType}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getTransactionStatusIcon(tx.status)}
                              <span className="text-sm">{tx.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary font-mono">
                            {tx.gatewayOrderId}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                          No transactions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

      </div>
    </div>
  );
};

export default SubscriptionManagement;
