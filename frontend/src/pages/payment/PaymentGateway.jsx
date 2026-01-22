
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Lock
} from 'lucide-react';

import { selectUser } from '../../store/slices/authSlice';
import { initiatePayment } from '../../api/paymentApi';
import { checkSubscription } from '../../api/subscriptionApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import SubscriptionDetailsModal from '../../components/subscription/SubscriptionDetailsModal';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [hasExistingSubscription, setHasExistingSubscription] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has org_uuid
    if (!user || !user.organizationUuid) {
      navigate('/login', { replace: true });
      return;
    }

    // Initialize payment
    initializePayment();
  }, [user]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await initiatePayment(
        user.organizationUuid,
        user.email
      );

      if (response.success && response.data) {
        setPaymentData(response.data);
        console.log('Payment initialized:', response.data);
      } else {
        setError(response.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Failed to connect to payment gateway. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!paymentData) return;

    // 🔒 Prevent double submission
    if (processingPayment) {
      console.log("Payment already processing, ignoring duplicate click");
      return;
    }

    // ✅ Check if subscription already exists
    try {
      const subscriptionCheck = await checkSubscription(user.organizationUuid);
      
      if (subscriptionCheck.success && subscriptionCheck.data.hasSubscription) {
        // Subscription exists - show modal instead of payment
        console.log("Existing subscription found, showing details modal");
        setHasExistingSubscription(true);
        setShowSubscriptionModal(true);
        return;
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
      // Continue with payment if check fails
    }

    // ✅ Check if PayHere SDK is loaded
    if (!window.payhere) {
      setError('Payment gateway not loaded. Please refresh the page and try again.');
      console.error('PayHere SDK not loaded');
      return;
    }

    setProcessingPayment(true);

    // Configure PayHere callbacks
    window.payhere.onCompleted = function (orderId) {
      console.log("Payment completed. OrderID:", orderId);
      setProcessingPayment(false);
      // Redirect to success page
      navigate('/payment/success?order_id=' + orderId, { replace: true });
    };

    window.payhere.onDismissed = function () {
      console.log("Payment dismissed");
      setProcessingPayment(false);
      setError('Payment was cancelled. Please try again.');
    };

    window.payhere.onError = function (error) {
      console.log("Payment Error:", error);
      setProcessingPayment(false);
      setError('Payment failed: ' + error);
    };

    // Prepare payment object according to PayHere JS SDK documentation
    const payment = {
      "sandbox": true, // Set to false in production
      "merchant_id": paymentData.paymentData.merchant_id,
      "return_url": undefined, // Important: must be undefined for JS SDK
      "cancel_url": undefined, // Important: must be undefined for JS SDK
      "notify_url": paymentData.paymentData.notify_url,
      "order_id": paymentData.orderId,
      "items": paymentData.paymentData.items,
      "amount": parseFloat(paymentData.amount).toFixed(2), // Format with 2 decimals
      "currency": paymentData.currency,
      "hash": paymentData.paymentData.hash,
      "first_name": paymentData.paymentData.first_name,
      "last_name": paymentData.paymentData.last_name || '',
      "email": paymentData.paymentData.email,
      "phone": paymentData.paymentData.phone || '',
      "address": paymentData.paymentData.address || '',
      "city": paymentData.paymentData.city || '',
      "country": paymentData.paymentData.country,
      "custom_1": paymentData.paymentData.custom_1,
      "custom_2": paymentData.paymentData.custom_2,
      // 🔄 Recurring subscription parameters
      "recurrence": paymentData.paymentData.recurrence || "1 Month",
      "duration": paymentData.paymentData.duration || "Forever"
    };

    console.log('Starting PayHere payment:', payment);

    // Show PayHere popup
    window.payhere.startPayment(payment);
  };

  const handleSkipTrial = () => {
    // For free trial, allow skip without card (optional feature)
    navigate('/org_admin/dashboard', { replace: true });
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
              onClick={initializePayment}
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
            Subscribe to CoreHive with monthly recurring billing
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Plan Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Your Plan Details
              </h3>

              <div className="space-y-4">
                {/* Plan Info */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
                  <div className="text-sm text-text-secondary mb-1">Selected Plan</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {paymentData?.planName || 'Standard Plan'}
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
                      LKR {paymentData?.planPrice || '500'} / {paymentData?.billingCycle?.toLowerCase() || 'month'}
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
          </motion.div>

          {/* Right Column - Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Payment Information
              </h3>

              <div className="space-y-4">
                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900 mb-1">
                        Secure Payment by PayHere
                      </div>
                      <div className="text-blue-700">
                        Your payment information is encrypted and secure. We use PayHere, 
                        Sri Lanka's trusted payment gateway.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-800">
                    <strong className="block mb-2">🔄 Recurring Monthly Subscription</strong>
                    After your 30-day free trial, you'll be automatically charged LKR {paymentData?.planPrice || '500'} monthly. Cancel anytime from your dashboard.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleProceedToPayment}
                    disabled={processingPayment}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {processingPayment ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleSkipTrial}
                    disabled={processingPayment}
                  >
                    Skip for Now (Start Trial)
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
          </motion.div>
        </div>

        {/* Footer Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-6 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-text-secondary">
              Protected by 256-bit SSL encryption
            </span>
          </div>
        </motion.div>
      </div>

      {/* Subscription Details Modal */}
      <SubscriptionDetailsModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        organizationUuid={user?.organizationUuid}
        onUpdate={() => {
          // Reload payment data after subscription update
          initializePayment();
        }}
      />
    </div>
  );
};

export default PaymentGateway;