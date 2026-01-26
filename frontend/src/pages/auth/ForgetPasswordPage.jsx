import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Swal from "sweetalert2";
import { apiPost } from "../../api/axios"; // Ensure this path is correct

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ReCaptcha from "../../components/common/ReCaptcha";

export const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaError, setRecaptchaError] = useState("");
  const recaptchaRef = useRef(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user types
    if (formErrors.email) {
      setFormErrors({ ...formErrors, email: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecaptchaError("");

    if (!validateForm()) {
      return;
    }

    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA verification");
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost("/auth/forgot-password", {
        email,
        recaptchaToken
      });

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Check your email for the temporary password',
          confirmButtonColor: '#02C39A',
          timer: 3000,
          showConfirmButton: true
        });
        setEmail(""); // Clear input
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: response.message || 'Failed to reset password',
          confirmButtonColor: '#02C39A',
        });
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again later',
        confirmButtonColor: '#02C39A',
      });
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
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
              <h2 className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                Enter your registered email address and we'll send you a
                temporary password.
              </p>
            </div>

            {status.message && (
              <Alert
                type={status.type}
                message={status.message}
                isOpen={!!status.message}
                onClose={() => setStatus({ type: "", message: "" })}
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

              <div className="space-y-2">
                <ReCaptcha
                  ref={recaptchaRef}
                  onChange={(token) => {
                    setRecaptchaToken(token);
                    setRecaptchaError("");
                  }}
                  onExpired={() => {
                    setRecaptchaToken(null);
                    setRecaptchaError(
                      "reCAPTCHA expired. Please verify again."
                    );
                  }}
                  onError={() => {
                    setRecaptchaToken(null);
                    setRecaptchaError("reCAPTCHA error. Please try again.");
                  }}
                />
                {recaptchaError && (
                  <p className="text-sm text-red-600">{recaptchaError}</p>
                )}
              </div>

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
      <Footer />
    </>
  );
};
