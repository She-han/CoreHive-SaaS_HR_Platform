/**
 * Face Attendance Kiosk Page
 * HR Staff opens camera, employees come and show face to mark attendance
 * Auto-detects any employee from the organization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, Check, X, Clock, AlertCircle, RefreshCw, 
  User, LogIn, LogOut, Loader2, Users, Play, Square
} from 'lucide-react';

// ===== Configuration =====
const AI_SERVICE_URL = 'http://localhost:8001';
const JAVA_BACKEND_URL = 'http://localhost:8080/api';

// ===== Helper Functions =====
const getAuthToken = () => {
  // Check both localStorage and sessionStorage
  const token = localStorage.getItem('corehive_token') || sessionStorage.getItem('corehive_token');
  
  if (!token) {
    console.warn('⚠️ No auth token found in storage');
  } else {
    console.log('✅ Token found:', token.substring(0, 20) + '...');
  }
  
  return token;
};

const base64ToBlob = (base64) => {
  try {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    throw error;
  }
};

// ===== API Functions =====
const checkFaceServiceHealth = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/face/health`);
    if (!response.ok) throw new Error('Service not responding');
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    return { status: 'unhealthy', dependencies_installed: false };
  }
};

const identifyEmployee = async (organizationUuid, imageBlob) => {
  const formData = new FormData();
  formData.append('organization_uuid', organizationUuid);
  formData.append('image', imageBlob, 'capture.jpg');

  const response = await fetch(`${AI_SERVICE_URL}/api/face/identify`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Identification failed');
  return data;
};

const markAttendanceForEmployee = async (employeeId, organizationUuid, confidence) => {
  const token = getAuthToken();
  
  // Check if token exists
  if (!token) {
    throw new Error('Unauthorized access. Please login first.');
  }

  console.log('📤 Marking attendance with token:', token.substring(0, 20) + '...');
  console.log('📤 Request body:', { employeeId, organizationUuid, confidence });

  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/mark-face`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: Number(employeeId), // Ensure it's a number
      organizationUuid: organizationUuid,
      verificationConfidence: String(confidence),
      deviceInfo: 'Face Attendance Kiosk'
    })
  });

  console.log('📥 Response status:', response.status);

  // Handle unauthorized
  if (response.status === 401) {
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();
  console.log('📥 Response data:', data);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to save attendance');
  }
  
  return data;
};

const getEmployeeDetails = async (employeeId) => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${JAVA_BACKEND_URL}/employees/${employeeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

const getTodayAttendanceList = async () => {
  const token = getAuthToken();
  if (!token) return [];
  
  try {
    const response = await fetch(`${JAVA_BACKEND_URL}/attendance/today-all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    const result = await response.json();
    return Array.isArray(result) ? result : (result.data || []);
  } catch {
    return [];
  }
};

// ===== Main Component =====
const FaceAttendancePage = () => {
  // State
  const [organizationUuid, setOrganizationUuid] = useState(null);
  const [serviceReady, setServiceReady] = useState(false);
  const [isKioskActive, setIsKioskActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [error, setError] = useState('');
  const [todayCount, setTodayCount] = useState({ checkIn: 0, checkOut: 0 });
  
  // Refs
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);

  // Webcam config
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      // Get organization from logged in user
      const user = JSON.parse(localStorage.getItem('corehive_user') || '{}');
      if (!user.organizationUuid) {
        setError('Please login as HR Staff to use this feature.');
        return;
      }
      setOrganizationUuid(user.organizationUuid);

      // Check AI service
      const health = await checkFaceServiceHealth();
      if (health.status === 'healthy' && health.dependencies_installed) {
        setServiceReady(true);
      } else {
        setError('Face recognition service is not available. Please contact administrator.');
      }

      // Load today's attendance
      const todayList = await getTodayAttendanceList();
      const checkIns = todayList.filter(a => a.checkInTime).length;
      const checkOuts = todayList.filter(a => a.checkOutTime).length;
      setTodayCount({ checkIn: checkIns, checkOut: checkOuts });
    };

    initialize();
  }, []);

  // Auto capture when kiosk is active
  useEffect(() => {
    if (isKioskActive && serviceReady && !isProcessing) {
      captureIntervalRef.current = setInterval(() => {
        captureAndIdentify();
      }, 3000); // Capture every 3 seconds
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isKioskActive, serviceReady, isProcessing]);

  // Capture and identify employee
  const captureAndIdentify = async () => {
    if (isProcessing || !webcamRef.current || !organizationUuid) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Identify employee from face
      const imageBlob = base64ToBlob(imageSrc);
      const identifyResult = await identifyEmployee(organizationUuid, imageBlob);
      
      console.log('🔍 Identify result:', identifyResult);

      if (!identifyResult.identified || !identifyResult.employee_id) {
        // No face detected or not recognized - just continue
        setIsProcessing(false);
        return;
      }

      // Step 2: Get employee details
      const employee = await getEmployeeDetails(identifyResult.employee_id);
      const employeeName = employee 
        ? `${employee.firstName} ${employee.lastName}` 
        : `Employee #${identifyResult.employee_id}`;

      // Step 3: Mark attendance
      const attendanceResult = await markAttendanceForEmployee(
        identifyResult.employee_id,
        organizationUuid,
        identifyResult.confidence || 0.85
      );

      console.log('✅ Attendance marked:', attendanceResult);

      // Update UI
      const resultData = {
        success: true,
        employeeId: identifyResult.employee_id,
        employeeName: employeeName,
        confidence: identifyResult.confidence,
        isCheckIn: attendanceResult.data?.isCheckIn ?? !attendanceResult.data?.checkOutTime,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit', hour12: true 
        }),
        photo: imageSrc
      };

      setLastResult(resultData);
      
      // Add to recent list
      setRecentAttendance(prev => [resultData, ...prev.slice(0, 9)]);

      // Update counts
      setTodayCount(prev => ({
        checkIn: resultData.isCheckIn ? prev.checkIn + 1 : prev.checkIn,
        checkOut: !resultData.isCheckIn ? prev.checkOut + 1 : prev.checkOut
      }));

      // Clear result after 5 seconds
      setTimeout(() => {
        setLastResult(null);
      }, 5000);

    } catch (err) {
      console.error('❌ Error:', err);
      // Don't show error for "no face" - just continue scanning
      if (!err.message.includes('No face') && !err.message.includes('not recognized')) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual capture
  const handleManualCapture = () => {
    captureAndIdentify();
  };

  // Toggle kiosk mode
  const toggleKiosk = () => {
    setIsKioskActive(!isKioskActive);
    setLastResult(null);
    setError('');
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Loading / Error states
  if (!organizationUuid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error || 'Please login as HR Staff to access this feature.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Face Attendance Kiosk</h1>
                <p className="text-blue-200 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 px-4 py-2 rounded-xl flex items-center">
                <LogIn className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-white font-bold">{todayCount.checkIn}</span>
                <span className="text-green-200 ml-1 text-sm">Check-ins</span>
              </div>
              <div className="bg-orange-500/20 px-4 py-2 rounded-xl flex items-center">
                <LogOut className="w-5 h-5 text-orange-400 mr-2" />
                <span className="text-white font-bold">{todayCount.checkOut}</span>
                <span className="text-orange-200 ml-1 text-sm">Check-outs</span>
              </div>
            </div>

            {/* Kiosk Toggle */}
            <button
              onClick={toggleKiosk}
              disabled={!serviceReady}
              className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
                isKioskActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isKioskActive ? (
                <>
                  <Square className="w-5 h-5" />
                  <span>Stop Kiosk</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Kiosk</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Camera Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Camera Header */}
              <div className={`px-6 py-4 ${
                isKioskActive 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <Camera className="w-6 h-6 mr-2" />
                      {isKioskActive ? '🔴 LIVE - Scanning for Employees' : 'Camera Ready'}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {isKioskActive 
                        ? 'Employees can show their face to mark attendance'
                        : 'Click "Start Kiosk" to begin scanning'}
                    </p>
                  </div>
                  {isKioskActive && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium">Recording</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera View */}
              <div className="relative bg-black aspect-video">
                {serviceReady ? (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Face Guide Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-64 h-80 border-4 border-dashed rounded-[120px] ${
                        isProcessing 
                          ? 'border-yellow-400 animate-pulse' 
                          : isKioskActive 
                            ? 'border-green-400 animate-pulse' 
                            : 'border-gray-400'
                      }`} />
                    </div>

                    {/* Processing Indicator */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-6 text-center">
                          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
                          <p className="text-gray-700 font-medium">Identifying...</p>
                        </div>
                      </div>
                    )}

                    {/* Success Result Overlay */}
                    {lastResult && lastResult.success && (
                      <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center animate-fade-in">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-14 h-14 text-green-500" />
                          </div>
                          <h3 className="text-3xl font-bold mb-2">{lastResult.employeeName}</h3>
                          <p className="text-2xl">
                            {lastResult.isCheckIn ? '✅ Check-in' : '👋 Check-out'} at {lastResult.time}
                          </p>
                          <p className="text-lg mt-2 opacity-80">
                            Confidence: {Math.round((lastResult.confidence || 0.85) * 100)}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    {!isProcessing && !lastResult && isKioskActive && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <p className="text-white text-center text-lg">
                          👤 Position your face within the oval guide
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <p className="text-white text-lg">Face Recognition Service Unavailable</p>
                      <p className="text-gray-400 text-sm mt-2">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Controls */}
              <div className="p-4 bg-gray-50 flex justify-center space-x-4">
                <button
                  onClick={handleManualCapture}
                  disabled={!serviceReady || isProcessing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-5 h-5" />
                  <span>Manual Capture</span>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="px-6 py-3 bg-red-50 border-t border-red-200">
                  <p className="text-red-600 text-center">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Attendance Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Attendance
                </h3>
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto">
                {recentAttendance.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No attendance recorded yet</p>
                    <p className="text-sm">Start the kiosk to begin</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAttendance.map((item, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-xl border-2 ${
                          item.isCheckIn 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-orange-50 border-orange-200'
                        } ${index === 0 ? 'animate-slide-in' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          {item.photo ? (
                            <img 
                              src={item.photo} 
                              alt="" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {item.employeeName}
                            </p>
                            <p className={`text-sm ${
                              item.isCheckIn ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {item.isCheckIn ? '✅ Check-in' : '👋 Check-out'} • {item.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default FaceAttendancePage;