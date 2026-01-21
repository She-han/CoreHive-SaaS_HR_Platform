import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Package
} from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  getSubscriptionDetails,
  cancelSubscription,
  changePlan,
  getAvailablePlans
} from '../../api/subscriptionApi';

const SubscriptionDetailsModal = ({ isOpen, onClose, organizationUuid, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && organizationUuid) {
      loadData();
    }
  }, [isOpen, organizationUuid]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load subscription details and available plans
      const [detailsRes, plansRes] = await Promise.all([
        getSubscriptionDetails(organizationUuid),
        getAvailablePlans()
      ]);

      if (detailsRes.success) {
        setSubscriptionData(detailsRes.data);
      }

      if (plansRes.success) {
        setAvailablePlans(plansRes.data);
      }
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to all features at the end of your current billing period.')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await cancelSubscription(organizationUuid);

      if (response.success) {
        alert('Subscription cancelled successfully');
        onUpdate && onUpdate();
        onClose();
      } else {
        alert(response.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      alert('Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    try {
      setProcessing(true);
      const response = await changePlan(organizationUuid, selectedPlan.id);

      if (response.success) {
        alert('Plan changed successfully');
        setShowPlanChange(false);
        loadData(); // Reload data
        onUpdate && onUpdate();
      } else {
        alert(response.message || 'Failed to change plan');
      }
    } catch (err) {
      console.error('Error changing plan:', err);
      alert('Failed to change plan');
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary-500" />
                Subscription Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Plan Section */}
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
                      <div className="flex items-center gap-3">
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
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-xs text-text-secondary">Trial Ends</div>
                            <div className="text-sm font-semibold text-text-primary">
                              {new Date(subscriptionData.subscription.trialEndDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
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

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => setShowPlanChange(!showPlanChange)}
                      icon={TrendingUp}
                      disabled={processing || subscriptionData?.subscription?.status === 'CANCELED'}
                    >
                      {showPlanChange ? 'Hide Plans' : 'Change Plan'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={processing || subscriptionData?.subscription?.status === 'CANCELED'}
                    >
                      Cancel Subscription
                    </Button>
                  </div>

                  {/* Plan Change Section */}
                  {showPlanChange && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Available Plans
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {availablePlans.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              selectedPlan?.id === plan.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <div className="text-lg font-bold text-text-primary">{plan.name}</div>
                            <div className="text-2xl font-bold text-primary-600 my-2">
                              LKR {plan.price}
                            </div>
                            <div className="text-sm text-text-secondary">{plan.period}</div>
                            <div className="text-xs text-text-secondary mt-2">{plan.employees} employees</div>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleChangePlan}
                        disabled={!selectedPlan || processing}
                        className="w-full"
                      >
                        {processing ? 'Processing...' : 'Confirm Plan Change'}
                      </Button>
                    </motion.div>
                  )}

                  {/* Transaction History */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Transaction History</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionDetailsModal;
