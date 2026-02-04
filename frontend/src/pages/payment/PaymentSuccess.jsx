
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Gift, Calendar } from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { selectUser, updateSubscriptionStatus } from '../../store/slices/authSlice';
import { markPaymentSuccess } from '../../api/paymentApi';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [saving, setSaving] = useState(true);
  const user = useSelector(selectUser);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const orgUuid = user?.organizationUuid;
    const orderId = searchParams.get('order_id');

    const markSuccess = async () => {
      if (!orgUuid) {
        setSaving(false);
        return;
      }
      try {
        const resp = await markPaymentSuccess(orgUuid, orderId);
        if (resp?.success) {
          dispatch(updateSubscriptionStatus({
            requiresPayment: false,
            hasActiveSubscription: true,
            subscriptionStatus: 'ACTIVE',
          }));
          // Also update localStorage user snapshot
          const storedUser = JSON.parse(localStorage.getItem('corehive_user') || '{}');
          storedUser.requiresPayment = false;
          storedUser.hasActiveSubscription = true;
          storedUser.subscriptionStatus = 'ACTIVE';
          localStorage.setItem('corehive_user', JSON.stringify(storedUser));
        }
      } catch (err) {
        console.error('Failed to mark payment success', err);
      } finally {
        setSaving(false);
      }
    };

    markSuccess();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/org_admin/dashboard', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, searchParams, dispatch, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
          >
            Payment Verified Successfully! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-text-secondary mb-8"
          >
            Your subscription is now active with a 30-day free trial period
          </motion.p>

          {/* Trial Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold text-text-primary">
                Free Trial Active
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-white rounded-lg p-4">
                <Calendar className="w-5 h-5 text-primary-600 mb-2" />
                <div className="text-sm text-text-secondary">Trial Period</div>
                <div className="text-lg font-bold text-text-primary">30 Days Free</div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-sm text-text-secondary">Order ID</div>
                <div className="text-lg font-bold text-text-primary">
                  {orderId || 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-text-secondary">
              ✓ Full access to all features<br />
              ✓ No charges during trial<br />
              ✓ Cancel anytime before trial ends
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/org_admin/dashboard', { replace: true })}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full md:w-auto"
            >
              Go to Dashboard
            </Button>

            <p className="text-sm text-text-secondary mt-4">
              Redirecting in {countdown} seconds...
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;