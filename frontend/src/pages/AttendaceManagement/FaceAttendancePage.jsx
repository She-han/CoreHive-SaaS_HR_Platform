/**
 * Face Attendance Kiosk Page
 * HR Staff opens camera, employees come and show face to mark attendance
 * Supports both Check-in and Check-out modes
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Check,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  User,
  LogIn,
  LogOut,
  Loader2,
  Users,
  Play,
  Square,
  UserCheck,
  UserMinus
} from "lucide-react";

// ===== Configuration =====
const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8001";
const JAVA_BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
// ===== Helper Functions =====
const getAuthToken = () => {
  const token =
    localStorage.getItem("corehive_token") ||
    sessionStorage.getItem("corehive_token");
  if (!token) {
    console.warn("⚠️ No auth token found in storage");
  }
  return token;
};

const base64ToBlob = (base64) => {
  try {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (error) {
    console.error("Error converting base64 to blob:", error);
    throw error;
  }
};

const playSound = (type) => {
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "success") {
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
    } else if (type === "error") {
      oscillator.frequency.value = 300;
      oscillator.type = "square";
    }

    gainNode.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    console.log("Audio not available");
  }
};

// ===== API Functions =====
const checkFaceServiceHealth = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/face/health`);
    if (!response.ok) throw new Error("Service not responding");
    return await response.json();
  } catch (error) {
    console.error("Health check error:", error);
    return { status: "unhealthy", dependencies_installed: false };
  }
};

const identifyEmployee = async (organizationUuid, imageBlob) => {
  const formData = new FormData();
  formData.append("organization_uuid", organizationUuid);
  formData.append("image", imageBlob, "capture.jpg");

  const response = await fetch(`${AI_SERVICE_URL}/api/face/identify`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Identification failed");
  return data;
};

const markCheckIn = async (employeeId, organizationUuid, confidence) => {
  const token = getAuthToken();
  if (!token) throw new Error("Please login first");

  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: Number(employeeId),
      organizationUuid,
      verificationConfidence: String(confidence),
      deviceInfo: "Face Attendance Kiosk"
    })
  });

  const data = await response.json();
  if (response.status === 401)
    throw new Error("Session expired. Please login again.");
  if (!response.ok) throw new Error(data.message || "Failed to mark check-in");
  return data;
};

const markCheckOut = async (employeeId, organizationUuid, confidence) => {
  const token = getAuthToken();
  if (!token) throw new Error("Please login first");

  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/check-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: Number(employeeId),
      organizationUuid,
      verificationConfidence: String(confidence),
      deviceInfo: "Face Attendance Kiosk"
    })
  });

  const data = await response.json();
  if (response.status === 401)
    throw new Error("Session expired. Please login again.");
  if (!response.ok) throw new Error(data.message || "Failed to mark check-out");
  return data;
};

const getEmployeeDetails = async (employeeId) => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `${JAVA_BACKEND_URL}/employees/${employeeId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
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
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return [];
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
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
  const [error, setError] = useState("");

  // Mode: 'checkin' or 'checkout'
  const [mode, setMode] = useState("checkin");

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
    facingMode: "user"
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

    const checkIns = list.filter((a) => a.checkInTime).length;
    const checkOuts = list.filter((a) => a.checkOutTime).length;
    setTodayCount({ checkIn: checkIns, checkOut: checkOuts });
  }, []);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      const user = JSON.parse(localStorage.getItem("corehive_user") || "{}");
      if (!user.organizationUuid) {
        setError("Please login as HR Staff to use this feature.");
        return;
      }
      setOrganizationUuid(user.organizationUuid);

      const health = await checkFaceServiceHealth();
      if (health.status === "healthy" && health.dependencies_installed) {
        setServiceReady(true);
      } else {
        setError("Face recognition service is not available.");
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
    return todayAttendance.some(
      (a) => a.employeeId === Number(employeeId) && a.checkInTime
    );
  };

  // Check if employee already checked out today
  const hasCheckedOutToday = (employeeId) => {
    return todayAttendance.some(
      (a) => a.employeeId === Number(employeeId) && a.checkOutTime
    );
  };

  // Capture and process based on mode
  const captureAndProcess = async () => {
    if (isProcessing || !webcamRef.current || !organizationUuid) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    setError("");

    try {
      // Step 1: Identify employee
      const imageBlob = base64ToBlob(imageSrc);
      const identifyResult = await identifyEmployee(
        organizationUuid,
        imageBlob
      );

      console.log("Identify result:", identifyResult);

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

      if (mode === "checkin") {
        // Check if already checked in
        if (hasCheckedInToday(employeeId)) {
          setLastResult({
            success: false,
            employeeName,
            message: "Already checked in today!",
            isCheckIn: true,
            photo: imageSrc
          });
          playSound("error");
          setTimeout(() => setLastResult(null), 3000);
          setIsProcessing(false);
          return;
        }

        result = await markCheckIn(
          employeeId,
          organizationUuid,
          identifyResult.confidence
        );
      } else {
        // Check-out mode
        if (!hasCheckedInToday(employeeId)) {
          setLastResult({
            success: false,
            employeeName,
            message: "No check-in record found!",
            isCheckIn: false,
            photo: imageSrc
          });
          playSound("error");
          setTimeout(() => setLastResult(null), 3000);
          setIsProcessing(false);
          return;
        }

        if (hasCheckedOutToday(employeeId)) {
          setLastResult({
            success: false,
            employeeName,
            message: "Already checked out today!",
            isCheckIn: false,
            photo: imageSrc
          });
          playSound("error");
          setTimeout(() => setLastResult(null), 3000);
          setIsProcessing(false);
          return;
        }

        result = await markCheckOut(
          employeeId,
          organizationUuid,
          identifyResult.confidence
        );
      }

      console.log("✅ Attendance result:", result);

      if (result.success) {
        const resultData = {
          success: true,
          employeeId,
          employeeName: result.employeeName || employeeName,
          confidence: identifyResult.confidence,
          isCheckIn: mode === "checkin",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }),
          photo: imageSrc,
          message: result.message
        };

        setLastResult(resultData);
        playSound("success");

        // Refresh attendance list
        await fetchTodayAttendance();

        setTimeout(() => setLastResult(null), 4000);
      } else {
        setLastResult({
          success: false,
          employeeName,
          message: result.message || "Failed to mark attendance",
          isCheckIn: mode === "checkin",
          photo: imageSrc
        });
        playSound("error");
        setTimeout(() => setLastResult(null), 3000);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      if (
        !err.message.includes("No face") &&
        !err.message.includes("not recognized")
      ) {
        setError(err.message);
        setTimeout(() => setError(""), 5000);
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
    setError("");
  };

  // Switch mode
  const switchMode = (newMode) => {
    if (isKioskActive) {
      setIsKioskActive(false);
    }
    setMode(newMode);
    setLastResult(null);
    setError("");
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const getDisplayName = (attendance) => {
    const employee = attendance?.employee;
    if (employee) {
      const fullName = [employee.firstName, employee.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (fullName) return fullName;
      if (employee.fullName) return employee.fullName;
    }

    if (attendance?.employeeName) return attendance.employeeName;
    if (attendance?.fullName) return attendance.fullName;
    if (attendance?.employeeId) return `Employee #${attendance.employeeId}`;
    return "Unknown Employee";
  };

  // Loading / Error states
  if (!organizationUuid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            {error || "Please login as HR Staff to access this feature."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col p-6 lg:p-10 bg-[#F1FDF9] text-[#333333]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            Face Attendance Marking
          </h1>
          <p className="text-[#9B9B9B] font-medium">
            AI-powered facial recognition for automated attendance tracking
          </p>
        </div>
        {/* TAB SWITCHER */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-[#9B9B9B]/20 w-full md:w-auto">
          <button
            onClick={() => switchMode("checkin")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all duration-200 ${
              mode === "checkin"
                ? "bg-[#02C39A] text-white shadow-md"
                : "text-[#9B9B9B] hover:bg-[#F1FDF9]"
            }`}
          >
            <LogIn size={18} /> Check-In
          </button>
          <button
            onClick={() => switchMode("checkout")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all duration-200 ${
              mode === "checkout"
                ? "bg-[#05668D] text-white shadow-md"
                : "text-[#9B9B9B] hover:bg-[#F1FDF9]"
            }`}
          >
            <LogOut size={18} /> Check-Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* CAMERA VIEWPORT (COL-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-3xl shadow-xl border border-[#9B9B9B]/10 overflow-hidden flex flex-col h-full">
            {/* CAMERA HEADER */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${isKioskActive ? "bg-red-500 animate-pulse" : "bg-gray-300"}`}
                />
                <h2 className="font-bold text-[#333333] uppercase tracking-wider text-sm">
                  {isKioskActive ? "Live Camera Active" : "Camera Standby"}
                </h2>
              </div>

              <div className="flex gap-3">
                {!isKioskActive ? (
                  <button
                    onClick={toggleKiosk}
                    disabled={!serviceReady}
                    className="flex items-center gap-2 bg-[#1ED292] hover:bg-[#02C39A] text-white px-6 py-2 rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    <Play size={16} fill="currentColor" /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={toggleKiosk}
                    className="flex items-center gap-2 bg-[#333333] hover:bg-black text-white px-6 py-2 rounded-xl font-bold transition-all transform active:scale-95"
                  >
                    <Square size={16} fill="currentColor" /> Stop
                  </button>
                )}
              </div>
            </div>

            {/* CAMERA STAGE */}
            <div className="relative bg-[#0C397A] flex-1 min-h-[450px] flex items-center justify-center">
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
                    <div
                      className={`w-64 h-80 border-4 border-dashed rounded-[120px] ${
                        isProcessing
                          ? "border-yellow-400 animate-pulse"
                          : isKioskActive
                            ? mode === "checkin"
                              ? "border-[#02C39A]"
                              : "border-[#05668D]"
                            : "border-gray-400"
                      } ${isKioskActive ? "animate-pulse" : ""}`}
                    />
                  </div>

                  {!isKioskActive && !lastResult && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                      <Camera size={64} strokeWidth={1} className="mb-4" />
                      <p className="font-medium">
                        Click "Start Camera" to begin face recognition
                      </p>
                    </div>
                  )}

                  {/* Processing Indicator */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="bg-white rounded-2xl p-6 text-center">
                        <Loader2 className="w-12 h-12 text-[#02C39A] animate-spin mx-auto mb-3" />
                        <p className="text-gray-700 font-medium">
                          Identifying...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* OVERLAY RESULTS */}
                  {lastResult && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center z-10 animate-in fade-in zoom-in duration-300 ${
                        lastResult.success ? "bg-[#02C39A]/95" : "bg-red-600/95"
                      }`}
                    >
                      <div className="text-center text-white p-8">
                        <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 shadow-2xl">
                          {lastResult.success ? (
                            <Check
                              size={48}
                              className="text-[#02C39A]"
                              strokeWidth={3}
                            />
                          ) : (
                            <X
                              size={48}
                              className="text-red-500"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <h3 className="text-3xl font-black mb-2 tracking-tight">
                          {lastResult.success ? "VERIFIED" : "ACCESS DENIED"}
                        </h3>
                        <p className="text-lg opacity-90 font-medium mb-2">
                          {lastResult.employeeName}
                        </p>
                        {lastResult.success && (
                          <>
                            <p className="text-xl mb-2">
                              {lastResult.isCheckIn ? "✅ Check-in" : "👋 Check-out"} at {lastResult.time}
                            </p>
                            <p className="text-sm opacity-75">
                              Confidence: {Math.round((lastResult.confidence || 0.85) * 100)}%
                            </p>
                          </>
                        )}
                        {!lastResult.success && (
                          <p className="text-lg opacity-90">{lastResult.message}</p>
                        )}
                        <button
                          onClick={() => setLastResult(null)}
                          className="mt-8 px-6 py-2 border-2 border-white/50 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          Dismiss
                        </button>
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
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                  <AlertCircle size={64} strokeWidth={1} className="mb-4 text-red-500" />
                  <p className="font-medium text-white text-lg">
                    Face Recognition Service Unavailable
                  </p>
                  <p className="text-gray-400 text-sm mt-2">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECENT LOGS (COL-4) */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white rounded-3xl shadow-xl border border-[#9B9B9B]/10 overflow-hidden h-full flex flex-col">
            <div className="p-6 h-full overflow-auto">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#333333] mb-2">
                  {mode === "checkin" ? "Check-In Logs" : "Check-Out Logs"}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#02C39A]/10 px-4 py-2 rounded-lg flex items-center border border-[#02C39A]/20">
                    <LogIn className="w-4 h-4 text-[#02C39A] mr-2" />
                    <span className="text-[#333333] font-bold text-sm">
                      {todayCount.checkIn}
                    </span>
                    <span className="text-[#02C39A] ml-1 text-xs font-medium">In</span>
                  </div>
                  <div className="bg-[#05668D]/10 px-4 py-2 rounded-lg flex items-center border border-[#05668D]/20">
                    <LogOut className="w-4 h-4 text-[#05668D] mr-2" />
                    <span className="text-[#333333] font-bold text-sm">
                      {todayCount.checkOut}
                    </span>
                    <span className="text-[#05668D] ml-1 text-xs font-medium">Out</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {todayAttendance.length === 0 ? (
                  <div className="text-center py-12 text-[#9B9B9B]">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No attendance recorded yet</p>
                    <p className="text-sm">Start the camera to begin</p>
                  </div>
                ) : (
                  <>
                    {todayAttendance
                      .filter((a) =>
                        mode === "checkin" ? a.checkInTime : a.checkOutTime
                      )
                      .sort((a, b) => {
                        const timeA = a.checkOutTime || a.checkInTime;
                        const timeB = b.checkOutTime || b.checkInTime;
                        return new Date(timeB) - new Date(timeA);
                      })
                      .map((attendance, index) => (
                        <div
                          key={attendance.id || index}
                          className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#02C39A]/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-[#02C39A]" />
                              </div>
                              <div>
                                <p className="font-bold text-[#333333] text-sm">
                                  {getDisplayName(attendance)}
                                </p>
                                <p className="text-xs text-[#9B9B9B]">
                                  {mode === "checkin"
                                    ? formatDateTime(attendance.checkInTime)
                                    : formatDateTime(attendance.checkOutTime)}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                mode === "checkin"
                                  ? "bg-[#02C39A]/10 text-[#02C39A]"
                                  : "bg-[#05668D]/10 text-[#05668D]"
                              }`}
                            >
                              {mode === "checkin" ? "IN" : "OUT"}
                            </div>
                          </div>
                        </div>
                      ))}
                  </>
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
