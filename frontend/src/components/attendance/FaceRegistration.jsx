/**
 * Face Registration Component
 * Employee face එක register කරන්න webcam පාවිච්චි කරනවා
 */

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check, X, User, AlertCircle } from 'lucide-react';
import { registerFace, checkFaceRegistrationStatus } from '../../api/faceRecognitionApi';

const FaceRegistration = ({ employeeId, organizationUuid, onSuccess, onClose }) => {
  // State variables
  const [step, setStep] = useState('camera'); // 'camera', 'preview', 'processing', 'success', 'error'
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Webcam reference
  const webcamRef = useRef(null);

  // Webcam settings
  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: 'user', // Front camera
  };

  // Check if already registered
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkFaceRegistrationStatus(employeeId, organizationUuid);
        setIsRegistered(status.registered);
      } catch (err) {
        console.error('Status check failed:', err);
      }
    };
    checkStatus();
  }, [employeeId, organizationUuid]);

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setStep('preview');
      setError('');
    }
  }, [webcamRef]);

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setStep('camera');
    setError('');
  };

  // Convert base64 to Blob
  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Submit registration
  const handleSubmit = async () => {
    if (!capturedImage) return;
    
    setStep('processing');
    setError('');

    try {
      const imageBlob = base64ToBlob(capturedImage);
      const result = await registerFace(employeeId, organizationUuid, imageBlob);
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess && onSuccess(result);
        }, 2000);
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to register face. Please try again.');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Face Registration</h2>
                <p className="text-blue-100 text-sm">Register your face for attendance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Already Registered Warning */}
          {isRegistered && step === 'camera' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Already Registered</p>
                <p className="text-yellow-600 text-sm">
                  You have already registered your face. Registering again will replace your existing photo.
                </p>
              </div>
            </div>
          )}

          {/* Camera View */}
          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-gray-900">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full"
                />
                {/* Face Guide Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-60 border-4 border-dashed border-white/50 rounded-full" />
                </div>
              </div>
              
              <div className="text-center text-gray-600 text-sm">
                <p>Position your face within the oval guide</p>
                <p>Ensure good lighting and look directly at the camera</p>
              </div>

              <button
                onClick={capturePhoto}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Camera className="w-5 h-5" />
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
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirm & Register</span>
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analyzing face...</p>
              <p className="text-gray-500 text-sm">This may take a few seconds</p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600">Your face has been registered for attendance.</p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Failed</h3>
                <p className="text-red-600">{error}</p>
              </div>
              
              <button
                onClick={retakePhoto}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;