/**
 * Face Attendance Page
 * Complete page for face recognition attendance
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, Check, X, Clock, AlertCircle, RefreshCw, 
  User, Settings, History, LogIn, LogOut, Loader2 
} from 'lucide-react';
import {
  verifyAndMarkAttendance,
  registerFaceFromBase64,
  checkFaceRegistrationStatus,
  getTodayAttendance,
  checkFaceServiceHealth
} from '../../api/faceRecognitionApi';

// Get user data from localStorage/context
const useUserData = () => {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      employeeId: user.linkedEmployeeId || user.employeeId,
      organizationUuid: user.organizationUuid,
      firstName: user.firstName,
      lastName: user.lastName
    });
  }, []);
  
  return userData;
};

const FaceAttendancePage = () => {
  // User data
  const userData = useUserData();
  
  // State
  const [mode, setMode] = useState('attendance'); // 'attendance' | 'register'
  const [step, setStep] = useState('loading'); // 'loading' | 'service-error' | 'not-registered' | 'ready' | 'preview' | 'processing' | 'success' | 'failed'
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Refs
  const webcamRef = useRef(null);

  // Webcam config
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  // Initialize - check service and registration
  useEffect(() => {
    const initialize = async () => {
      if (!userData?.employeeId || !userData?.organizationUuid) {
        return;
      }

      try {
        // Check AI service health
        const health = await checkFaceServiceHealth();
        if (health.status === 'unhealthy' || !health.dependencies_installed) {
          setStep('service-error');
          setError('Face recognition service is not available');
          return;
        }

        // Check registration status
        const status = await checkFaceRegistrationStatus(
          userData.employeeId,
          userData.organizationUuid
        );
        setIsRegistered(status.registered);

        // Get today's attendance
        const today = await getTodayAttendance();
        setTodayStatus(today);

        // Set appropriate step
        if (!status.registered && mode === 'attendance') {
          setStep('not-registered');
        } else {
          setStep('ready');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize. Please refresh the page.');
        setStep('service-error');
      }
    };

    initialize();
  }, [userData, mode]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setStep('preview');
      setError('');
    }
  }, []);

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setStep('ready');
    setError('');
  };

  // Handle attendance marking
  const handleMarkAttendance = async () => {
    if (!capturedImage || !userData) return;
    
    setStep('processing');
    setError('');

    try {
      const attendanceResult = await verifyAndMarkAttendance(
        userData.employeeId,
        userData.organizationUuid,
        capturedImage
      );

      setResult(attendanceResult);

      if (attendanceResult.success) {
        setStep('success');
        // Refresh today's status
        const today = await getTodayAttendance();
        setTodayStatus(today);
      } else {
        setStep('failed');
        setError(attendanceResult.message || 'Verification failed');
      }
    } catch (err) {
      setStep('failed');
      setError(err.message || 'Failed to mark attendance');
    }
  };

  // Handle face registration
  const handleRegisterFace = async () => {
    if (!capturedImage || !userData) return;
    
    setStep('processing');
    setError('');

    try {
      const registerResult = await registerFaceFromBase64(
        userData.employeeId,
        userData.organizationUuid,
        capturedImage
      );

      if (registerResult.success) {
        setIsRegistered(true);
        setStep('success');
        setResult({ message: 'Face registered successfully!' });
        
        // Switch to attendance mode after 2 seconds
        setTimeout(() => {
          setMode('attendance');
          setStep('ready');
          setCapturedImage(null);
        }, 2000);
      } else {
        throw new Error(registerResult.message || 'Registration failed');
      }
    } catch (err) {
      setStep('failed');
      setError(err.message || 'Failed to register face');
    }
  };

  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Format time
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '--:--';
    return new Date(dateTimeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Loading state
  if (!userData || step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {getCurrentTime()}
                </p>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => { setMode('attendance'); setStep('ready'); setCapturedImage(null); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'attendance' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-4 h-4 inline mr-2" />
                Attendance
              </button>
              <button
                onClick={() => { setMode('register'); setStep('ready'); setCapturedImage(null); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'register' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                {isRegistered ? 'Update Face' : 'Register Face'}
              </button>
            </div>
          </div>

          {/* Today's Status */}
          {todayStatus && mode === 'attendance' && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <LogIn className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-600">Check-in:</span>
                    <span className="ml-2 font-semibold">
                      {formatTime(todayStatus.checkInTime)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-gray-600">Check-out:</span>
                    <span className="ml-2 font-semibold">
                      {formatTime(todayStatus.checkOutTime)}
                    </span>
                  </div>
                </div>
                {todayStatus.status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    todayStatus.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                    todayStatus.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {todayStatus.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Title Bar */}
          <div className={`px-6 py-4 ${
            mode === 'attendance' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
              : 'bg-gradient-to-r from-green-600 to-green-700'
          }`}>
            <h2 className="text-xl font-bold text-white">
              {mode === 'attendance' ? '📷 Face Attendance' : '👤 Face Registration'}
            </h2>
            <p className="text-white/80 text-sm">
              {mode === 'attendance' 
                ? 'Look at the camera to mark your attendance'
                : 'Register your face for attendance system'}
            </p>
          </div>

          <div className="p-6">
            {/* Service Error */}
            {step === 'service-error' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Service Unavailable</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Retry
                </button>
              </div>
            )}

            {/* Not Registered */}
            {step === 'not-registered' && mode === 'attendance' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Face Not Registered</h3>
                <p className="text-gray-600 mb-6">
                  Please register your face before using face attendance.
                </p>
                <button
                  onClick={() => { setMode('register'); setStep('ready'); }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                >
                  Register Face Now
                </button>
              </div>
            )}

            {/* Camera Ready */}
            {step === 'ready' && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                  />
                  {/* Face Guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-56 h-72 border-4 border-dashed rounded-full ${
                      mode === 'attendance' ? 'border-blue-400' : 'border-green-400'
                    } animate-pulse`} />
                  </div>
                </div>

                <p className="text-center text-gray-600">
                  Position your face within the oval and ensure good lighting
                </p>

                <button
                  onClick={capturePhoto}
                  className={`w-full py-4 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors ${
                    mode === 'attendance'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Camera className="w-6 h-6" />
                  <span>Capture Photo</span>
                </button>
              </div>
            )}

            {/* Preview */}
            {step === 'preview' && capturedImage && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden">
                  <img src={capturedImage} alt="Captured" className="w-full" />
                </div>

                <p className="text-center text-gray-600">
                  Is this photo clear? Your face should be clearly visible.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={retakePhoto}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={mode === 'attendance' ? handleMarkAttendance : handleRegisterFace}
                    className={`flex-1 py-3 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 ${
                      mode === 'attendance'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                    <span>{mode === 'attendance' ? 'Mark Attendance' : 'Register Face'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {mode === 'attendance' ? 'Verifying face...' : 'Registering face...'}
                </p>
                <p className="text-gray-500 text-sm">Please wait</p>
              </div>
            )}

            {/* Success */}
            {step === 'success' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {result?.message || 'Success!'}
                </h3>
                {result?.data?.attendance && (
                  <div className="mt-4 text-gray-600">
                    <p>
                      {result.data.attendance.isCheckIn ? 'Check-in' : 'Check-out'} at{' '}
                      <span className="font-semibold">
                        {formatTime(result.data.attendance.isCheckIn 
                          ? result.data.attendance.checkInTime 
                          : result.data.attendance.checkOutTime)}
                      </span>
                    </p>
                    {result.data.verification?.confidence && (
                      <p className="text-sm text-gray-500 mt-1">
                        Confidence: {result.data.verification.confidence}
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => { setStep('ready'); setCapturedImage(null); }}
                  className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Done
                </button>
              </div>
            )}

            {/* Failed */}
            {step === 'failed' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {mode === 'attendance' ? 'Verification Failed' : 'Registration Failed'}
                  </h3>
                  <p className="text-red-600">{error}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm font-medium">Tips:</p>
                  <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside">
                    <li>Ensure good lighting on your face</li>
                    <li>Look directly at the camera</li>
                    <li>Remove sunglasses or hats</li>
                    <li>Keep your face centered</li>
                  </ul>
                </div>

                <button
                  onClick={retakePhoto}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAttendancePage;