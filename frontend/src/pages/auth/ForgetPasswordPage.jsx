import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { apiPost } from '../../api/axios'; // Ensure this path is correct

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export const ForgetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('/auth/forgot-password', { email });

      if (response.success) {
        setStatus({ 
          type: 'success', 
          message: 'Success! Check your email for the temporary password.' 
        });
        setEmail(''); // Clear input
      } else {
        setStatus({ 
          type: 'error', 
          message: response.message || 'Failed to reset password.' 
        });
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: 'An error occurred. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className=" bg-background-primary flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full">
          <Card className="bg-white shadow-lg">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Enter your registered email address and we'll send you a temporary password.
              </p>
            </div>

            {status.message && (
              <Alert 
                type={status.type} 
                message={status.message} 
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={Mail}
              />
              
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Reset Password
              </Button>

              <div className="text-center mt-4">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
      <Footer/>
    </>
  );
};