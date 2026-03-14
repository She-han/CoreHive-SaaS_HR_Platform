
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock
} from 'lucide-react';

import { selectUser } from '../../store/slices/authSlice';
import { updateUser } from '../../store/slices/authSlice';
import { getOrganizationBillingInfo } from '../../api/subscriptionApi';
import { initiatePayment } from '../../api/paymentApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [activatingTrial, setActivatingTrial] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has org_uuid
    if (!user || !user.organizationUuid) {
      navigate('/login', { replace: true });
      return;
    }

    // Load billing information
    loadBillingInfo();
  }, [user]);

  const loadBillingInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getOrganizationBillingInfo(user.organizationUuid);

      if (response.success && response.data) {
        setBillingInfo(response.data);
        console.log('Billing info loaded:', response.data);
      } else {
        setError(response.message || 'Failed to load billing information');
      }
    } catch (err) {
      console.error('Billing info error:', err);
      setError('Failed to load billing information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSubscription = async () => {
    if (activatingTrial) return;

    try {
      setActivatingTrial(true);
      setError(null);

      const response = await initiatePayment(user.organizationUuid, user.email);

      if (!response.success || !response.data) {
        setError(response.message || 'Failed to activate subscription');
        return;
      }

      if (!window.payhere) {
        setError('PayHere SDK not loaded. Please refresh and try again.');
        return;
      }

      const paymentData = response.data;

      window.payhere.onCompleted = function (orderId) {
        // Keep guard state aligned while moving to success flow.
        dispatch(updateUser({
          requiresPayment: true,
          hasActiveSubscription: false
        }));
        navigate(`/payment/success?order_id=${orderId}`, { replace: true });
      };

      window.payhere.onDismissed = function () {
        navigate('/payment/cancel', { replace: true });
      };

      window.payhere.onError = function (errorMessage) {
        setError(`Payment failed: ${errorMessage}`);
      };

      const payment = {
        sandbox: true,
        merchant_id: paymentData.paymentData.merchant_id,
        return_url: undefined,
        cancel_url: undefined,
        notify_url: paymentData.paymentData.notify_url,
        order_id: paymentData.orderId,
        items: paymentData.paymentData.items,
        amount: parseFloat(paymentData.amount).toFixed(2),
        currency: paymentData.currency,
        hash: paymentData.paymentData.hash,
        first_name: paymentData.paymentData.first_name,
        last_name: paymentData.paymentData.last_name || '',
        email: paymentData.paymentData.email,
        phone: paymentData.paymentData.phone || '',
        address: paymentData.paymentData.address || '',
        city: paymentData.paymentData.city || '',
        country: paymentData.paymentData.country || 'Sri Lanka',
        custom_1: paymentData.paymentData.custom_1,
        custom_2: paymentData.paymentData.custom_2,
        recurrence: paymentData.paymentData.recurrence || '1 Month',
        duration: paymentData.paymentData.duration || 'Forever'
      };

      window.payhere.startPayment(payment);
    } catch (err) {
      console.error('Subscription activation/payment error:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setActivatingTrial(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centerScreen text="Initializing payment gateway..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F1FDF9] to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Payment Setup Failed
          </h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="flex-1"
            >
              Back to Login
            </Button>
            <Button
              variant="primary"
              onClick={loadBillingInfo}
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1FDF9] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-text-secondary text-lg">
            Activate now and start billing from your next billing date
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Plan Details */}
      
            <Card className="h-full shadow-lg">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Your Plan Details
              </h3>

              <div className="space-y-4">
                {/* Plan Info */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
                  <div className="text-sm text-text-secondary mb-1">Selected Plan</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {billingInfo?.planName || 'Standard Plan'}
                  </div>
                </div>

                {/* Trial Period */}
                <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4">
                  <Clock className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-text-primary">
                      Free Trial - 1 Month
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      First month absolutely free! You'll only be charged after the trial period ends.
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Today's Payment</span>
                    <span className="text-2xl font-bold text-green-600">
                      LKR 0.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">After Trial Period</span>
                    <span className="font-semibold text-text-primary">
                      LKR {billingInfo?.price || '500'} / month
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-text-primary mb-3">
                    What's Included:
                  </h4>
                  <ul className="space-y-2">
                    {[
                      'Complete HR Management System',
                      'Employee Database & Profiles',
                      'Payroll Processing',
                      'Leave Management',
                      'Attendance Tracking',
                      '24/7 Customer Support'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          

          {/* Right Column - Payment Form */}
        
            <Card className="h-full border-0">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                Activation Information
              </h3>

              <div className="space-y-4">
                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900 mb-1">
                        Auto Billing Enabled
                      </div>
                      <div className="text-blue-700">
                        No charge is taken right now. CoreHive will calculate your renewal amount on the next billing date based on plan type and active user count.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-800">
                    <strong className="block mb-2">No Upfront Payment</strong>
                    Activate your subscription now. Your first automatic charge will happen on the next billing date based on your current plan and active users.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
     

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Activate Subscription</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleActivateSubscription}
                    disabled={activatingTrial}
                  >
                    {activatingTrial ? 'Activating...' : 'Activate Without Payment'}
                  </Button>
                </div>

                {/* Terms */}
                <div className="text-xs text-text-secondary text-center pt-2">
                  By proceeding, you agree to our{' '}
                  <a href="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </Card>
         
        </div>

     
      
      </div>

    </div>
  );
};

export default PaymentGateway;