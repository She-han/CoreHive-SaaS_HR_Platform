
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-red-600" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Payment Cancelled
          </h1>

          <p className="text-text-secondary mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                <strong className="text-text-primary">Need Help?</strong><br />
                Contact our support team if you're experiencing issues with payment.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              icon={ArrowLeft}
              className="flex-1"
            >
              Back to Login
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/payment-gateway')}
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;