/**
 * Face Attendance Kiosk Page
 * HR Staff opens camera, employees come and show face to mark attendance
 * Supports both Check-in and Check-out modes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, Check, X, Clock, AlertCircle, RefreshCw, 
  User, LogIn, LogOut, Loader2, Users, Play, Square,
  UserCheck, UserMinus
} from 'lucide-react';

// ===== Configuration =====
const AI_SERVICE_URL = 'http://localhost:8001';
const JAVA_BACKEND_URL = 'http://localhost:8080/api';

// ===== Helper Functions =====
const getAuthToken = () => {
  const token = localStorage.getItem('corehive_token') || sessionStorage.getItem('corehive_token');
  if (!token) {
    console.warn('⚠️ No auth token found in storage');
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

const playSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
    } else if (type === 'error') {
      oscillator.frequency.value = 300;
      oscillator.type = 'square';
    }
    
    gainNode.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    console.log('Audio not available');
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

const markCheckIn = async (employeeId, organizationUuid, confidence) => {
  const token = getAuthToken();
  if (!token) throw new Error('Please login first');

  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: Number(employeeId),
      organizationUuid,
      verificationConfidence: String(confidence),
      deviceInfo: 'Face Attendance Kiosk'
    })
  });

  const data = await response.json();
  if (response.status === 401) throw new Error('Session expired. Please login again.');
  if (!response.ok) throw new Error(data.message || 'Failed to mark check-in');
  return data;
};

const markCheckOut = async (employeeId, organizationUuid, confidence) => {
  const token = getAuthToken();
  if (!token) throw new Error('Please login first');

  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/check-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: Number(employeeId),
      organizationUuid,
      verificationConfidence: String(confidence),
      deviceInfo: 'Face Attendance Kiosk'
    })
  });

  const data = await response.json();
  if (response.status === 401) throw new Error('Session expired. Please login again.');
  if (!response.ok) throw new Error(data.message || 'Failed to mark check-out');
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
  const [error, setError] = useState('');
  
  // Mode: 'checkin' or 'checkout'
  const [mode, setMode] = useState('checkin');
  
  // Today's attendance from database
  const [todayAttendance, setTodayAttendance] = useState([]);
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

  // Fetch today's attendance from database
  const fetchTodayAttendance = useCallback(async () => {
    const list = await getTodayAttendanceList();
    setTodayAttendance(list);
    
    const checkIns = list.filter(a => a.checkInTime).length;
    const checkOuts = list.filter(a => a.checkOutTime).length;
    setTodayCount({ checkIn: checkIns, checkOut: checkOuts });
  }, []);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      const user = JSON.parse(localStorage.getItem('corehive_user') || '{}');
      if (!user.organizationUuid) {
        setError('Please login as HR Staff to use this feature.');
        return;
      }
      setOrganizationUuid(user.organizationUuid);

      const health = await checkFaceServiceHealth();
      if (health.status === 'healthy' && health.dependencies_installed) {
        setServiceReady(true);
      } else {
        setError('Face recognition service is not available.');
      }

      await fetchTodayAttendance();
    };

    initialize();
  }, [fetchTodayAttendance]);

  // Refresh attendance list every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTodayAttendance, 30000);
    return () => clearInterval(interval);
  }, [fetchTodayAttendance]);

  // Auto capture when kiosk is active
  useEffect(() => {
    if (isKioskActive && serviceReady && !isProcessing) {
      captureIntervalRef.current = setInterval(() => {
        captureAndProcess();
      }, 3000);
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isKioskActive, serviceReady, isProcessing, mode]);

  // Check if employee already checked in today
  const hasCheckedInToday = (employeeId) => {
    return todayAttendance.some(a => 
      a.employeeId === Number(employeeId) && a.checkInTime
    );
  };

  // Check if employee already checked out today
  const hasCheckedOutToday = (employeeId) => {
    return todayAttendance.some(a => 
      a.employeeId === Number(employeeId) && a.checkOutTime
    );
  };

  // Capture and process based on mode
  const captureAndProcess = async () => {
    if (isProcessing || !webcamRef.current || !organizationUuid) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Identify employee
      const imageBlob = base64ToBlob(imageSrc);
      const identifyResult = await identifyEmployee(organizationUuid, imageBlob);
      
      console.log('Identify result:', identifyResult);

      if (!identifyResult.identified || !identifyResult.employee_id) {
        setIsProcessing(false);
        return;
      }

      const employeeId = identifyResult.employee_id;
      
      // Step 2: Get employee details
      const employee = await getEmployeeDetails(employeeId);
      const employeeName = employee 
        ? `${employee.firstName} ${employee.lastName}` 
        : `Employee #${employeeId}`;

      // Step 3: Process based on mode
      let result;
      
      if (mode === 'checkin') {
        // Check if already checked in
        if (hasCheckedInToday(employeeId)) {
          setLastResult({
            success: false,
            employeeName,
            message: 'Already checked in today!',
            isCheckIn: true,
            photo: imageSrc
          });
          playSound('error');
          setTimeout(() => setLastResult(null), 3000);
          setIsProcessing(false);
          return;
        }
        
        result = await markCheckIn(employeeId, organizationUuid, identifyResult.confidence);
        
      } else {
        // Check-out mode
        if (!hasCheckedInToday(employeeId)) {
          setLastResult({
            success: false,
            employeeName,
            message: 'No check-in record found!',
            isCheckIn: false,
            photo: imageSrc
          });
          playSound('error');
          setTimeout(() => setLastResult(null), 3000);
          setIsProcessing(false);
          return;
        }
        
        if (hasCheckedOutToday(employeeId)) {
          setLastResult({
            success: false,
            employeeName,
            message: 'Already checked out today!',
            isCheckIn: false,
            photo: imageSrc
          });
          playSound('error');
          setTimeout(() => setLastResult(null), 3000);
          setIsProcessing(false);
          return;
        }
        
        result = await markCheckOut(employeeId, organizationUuid, identifyResult.confidence);
      }

      console.log('✅ Attendance result:', result);

      if (result.success) {
        const resultData = {
          success: true,
          employeeId,
          employeeName: result.employeeName || employeeName,
          confidence: identifyResult.confidence,
          isCheckIn: mode === 'checkin',
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', hour12: true 
          }),
          photo: imageSrc,
          message: result.message
        };

        setLastResult(resultData);
        playSound('success');
        
        // Refresh attendance list
        await fetchTodayAttendance();

        setTimeout(() => setLastResult(null), 4000);
      } else {
        setLastResult({
          success: false,
          employeeName,
          message: result.message || 'Failed to mark attendance',
          isCheckIn: mode === 'checkin',
          photo: imageSrc
        });
        playSound('error');
        setTimeout(() => setLastResult(null), 3000);
      }

    } catch (err) {
      console.error('❌ Error:', err);
      if (!err.message.includes('No face') && !err.message.includes('not recognized')) {
        setError(err.message);
        setTimeout(() => setError(''), 5000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual capture
  const handleManualCapture = () => {
    captureAndProcess();
  };

  // Toggle kiosk mode
  const toggleKiosk = () => {
    setIsKioskActive(!isKioskActive);
    setLastResult(null);
    setError('');
  };

  // Switch mode
  const switchMode = (newMode) => {
    if (isKioskActive) {
      setIsKioskActive(false);
    }
    setMode(newMode);
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

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDisplayName = (attendance) => {
    const employee = attendance?.employee;
    if (employee) {
      const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim();
      if (fullName) return fullName;
      if (employee.fullName) return employee.fullName;
    }

    if (attendance?.employeeName) return attendance.employeeName;
    if (attendance?.fullName) return attendance.fullName;
    if (attendance?.employeeId) return `Employee #${attendance.employeeId}`;
    return 'Unknown Employee';
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
    <div className="bg-gray-100 min-h-screen py-6 px-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${mode === 'checkin' ? 'bg-green-500' : 'bg-orange-500'}`}>
                {mode === 'checkin' ? (
                  <LogIn className="w-8 h-8 text-white" />
                ) : (
                  <LogOut className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Face Attendance - {mode === 'checkin' ? 'Check In' : 'Check Out'}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>

            {/* Mode Switch Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => switchMode('checkin')}
                className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                  mode === 'checkin'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span>Check In</span>
              </button>
              <button
                onClick={() => switchMode('checkout')}
                className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                  mode === 'checkout'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span>Check Out</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 px-4 py-2 rounded-lg flex items-center border border-green-200">
                <LogIn className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-900 font-bold">{todayCount.checkIn}</span>
                <span className="text-green-700 ml-1 text-sm">In</span>
              </div>
              <div className="bg-orange-100 px-4 py-2 rounded-lg flex items-center border border-orange-200">
                <LogOut className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-gray-900 font-bold">{todayCount.checkOut}</span>
                <span className="text-orange-700 ml-1 text-sm">Out</span>
              </div>
            </div>

            {/* Kiosk Toggle */}
            <button
              onClick={toggleKiosk}
              disabled={!serviceReady}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-md ${
                isKioskActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : mode === 'checkin' 
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isKioskActive ? (
                <>
                  <Square className="w-5 h-5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Camera Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Camera Header */}
              <div className={`px-6 py-4 ${
                isKioskActive 
                  ? mode === 'checkin'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-orange-500 to-amber-600'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <Camera className="w-6 h-6 mr-2" />
                      {isKioskActive ? (
                        <>🔴 LIVE - {mode === 'checkin' ? 'Check-In Mode' : 'Check-Out Mode'}</>
                      ) : (
                        'Camera Ready'
                      )}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {isKioskActive 
                        ? `Employees can show face to ${mode === 'checkin' ? 'check in' : 'check out'}`
                        : 'Click "Start" to begin scanning'}
                    </p>
                  </div>
                  {isKioskActive && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium">Scanning</span>
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
                            ? mode === 'checkin' ? 'border-green-400' : 'border-orange-400'
                            : 'border-gray-400'
                      } ${isKioskActive ? 'animate-pulse' : ''}`} />
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

                    {/* Result Overlay */}
                    {lastResult && (
                      <div className={`absolute inset-0 ${
                        lastResult.success 
                          ? 'bg-green-500/90' 
                          : 'bg-red-500/90'
                      } flex items-center justify-center animate-fade-in`}>
                        <div className="text-center text-white">
                          <div className={`w-24 h-24 ${
                            lastResult.success ? 'bg-white' : 'bg-white'
                          } rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {lastResult.success ? (
                              <Check className={`w-14 h-14 ${
                                lastResult.isCheckIn ? 'text-green-500' : 'text-orange-500'
                              }`} />
                            ) : (
                              <X className="w-14 h-14 text-red-500" />
                            )}
                          </div>
                          <h3 className="text-3xl font-bold mb-2">{lastResult.employeeName}</h3>
                          {lastResult.success ? (
                            <>
                              <p className="text-2xl">
                                {lastResult.isCheckIn ? '✅ Check-in' : '👋 Check-out'} at {lastResult.time}
                              </p>
                              <p className="text-lg mt-2 opacity-80">
                                Confidence: {Math.round((lastResult.confidence || 0.85) * 100)}%
                              </p>
                            </>
                          ) : (
                            <p className="text-xl">{lastResult.message}</p>
                          )}
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
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center space-x-4">
                <button
                  onClick={handleManualCapture}
                  disabled={!serviceReady || isProcessing}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === 'checkin'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  <span>Manual Capture</span>
                </button>
                <button
                  onClick={fetchTodayAttendance}
                  className="px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-semibold flex items-center space-x-2 shadow-sm transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh</span>
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

          {/* Today's Attendance Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[600px]">
              <div className={`px-6 py-4 ${
                mode === 'checkin' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600'
              }`}>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Today's Attendance ({todayAttendance.length})
                </h3>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {todayAttendance.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No attendance recorded yet</p>
                    <p className="text-sm">Start the kiosk to begin</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAttendance
                      .sort((a, b) => {
                        const timeA = a.checkOutTime || a.checkInTime;
                        const timeB = b.checkOutTime || b.checkInTime;
                        return new Date(timeB) - new Date(timeA);
                      })
                      .map((attendance, index) => (
                      <div 
                        key={attendance.id || index} 
                        className={`p-3 rounded-xl border-2 ${
                          attendance.checkOutTime 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              attendance.checkOutTime 
                                ? 'bg-gray-200' 
                                : 'bg-green-200'
                            }`}>
                              {attendance.checkOutTime ? (
                                <UserCheck className="w-5 h-5 text-gray-600" />
                              ) : (
                                <User className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {getDisplayName(attendance)}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span className="text-green-600">
                                  In: {formatDateTime(attendance.checkInTime)}
                                </span>
                                {attendance.checkOutTime && (
                                  <span className="text-orange-600">
                                    Out: {formatDateTime(attendance.checkOutTime)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendance.checkOutTime 
                              ? 'bg-gray-200 text-gray-600' 
                              : 'bg-green-200 text-green-700'
                          }`}>
                            {attendance.checkOutTime ? 'Done' : 'Active'}
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
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default FaceAttendancePage;