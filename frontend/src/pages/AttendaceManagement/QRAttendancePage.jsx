/**
 * QR Attendance Marking
 *
 * - UI aligned with AttendanceManualMarking
 * - Check-In / Check-Out tabs
 * - Shows today's attendance list
 * - TEST QR used internally (hidden)
 *
 * 🚨 PRODUCTION CHANGES:
 * 1. Remove TEST_QR_TOKEN
 * 2. Enable real webcam scanning (Html5Qrcode.start)
 */

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { LogIn, LogOut, Camera, Play, Square, Check, X } from "lucide-react";
import TodayAttendanceList from "../../components/attendance/TodayAttendanceList";

// ================= CONFIG =================
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ================= TEST QR TOKEN =================
// 🔴 INTERNAL TESTING ONLY
// 🚨 PRODUCTION: REMOVE THIS
// const TEST_QR_TOKEN =
//  "eyJhbGciOiJIUzI1NiJ9.eyJvcmdhbml6YXRpb25VdWlkIjoiNGJmOGQxNWUtNGVmNS00MmM5LTkyM2QtZTBhYTFhMDM0NWI2IiwicXJUeXBlIjoiUEVSTUFORU5UX0FUVEVOREFOQ0UiLCJlbXBsb3llZUlkIjo4LCJzdWIiOiJFTVBMT1lFRV9RUiIsImlhdCI6MTc2ODY0Njk5MX0.eZ68MhBMt20JNo3JOCW95rMeyvhsCXT04-wPZr-zyME";

// // ================= HELPERS =================
const getAuthToken = () =>
  localStorage.getItem("corehive_token") ||
  sessionStorage.getItem("corehive_token");

// ================= COMPONENT =================
const QrAttendanceMarking = () => {
  const scannerRef = useRef(null);
  const scannedOnceRef = useRef(false);

  const [activeTab, setActiveTab] = useState("checkin");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);

  // ================= FETCH TODAY ATTENDANCE =================
  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // Cleanup camera on unmount
useEffect(() => {
  return () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear().catch(() => {});
    }
  };
}, []);


  const fetchTodayAttendance = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/attendance/today-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setTodayAttendance(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error("Failed to load attendance", e);
    }
  };

  // ================= START =================
  const startScanning = async () => {
  if (isScanning) return;

  setResult(null);
  scannedOnceRef.current = false;
  setIsScanning(true);

  const html5QrCode = new Html5Qrcode("qr-reader");
  scannerRef.current = html5QrCode;

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 15, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (scannedOnceRef.current) return;

        scannedOnceRef.current = true;

        await html5QrCode.stop();
        await html5QrCode.clear();
        scannerRef.current = null;
        setIsScanning(false);

        submitQr(decodedText); // ✅ JWT goes to backend
      },
      () => {} // silent scan errors
    );
  } catch (err) {
    console.error("Camera start failed", err);
    setIsScanning(false);
  }
};


  // ================= STOP =================
const stopScanning = async () => {
  try {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    }
  } catch (e) {
    console.warn("Stop scan failed", e);
  }

  scannedOnceRef.current = false;
  scannerRef.current = null;
  setIsScanning(false);
};



  // ================= SUBMIT QR =================
  const submitQr = async (qrToken) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE}/attendance/qr/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult({ success: false, message: data.message });
        return;
      }

      setResult({
        success: true,
        message: data.message,
        action: data.data?.action
      });

      fetchTodayAttendance();

    } catch (err) {
      setResult({ success: false, message: err.message });
    }
  };

  // ================= FILTER LIST =================
  const checkInList = todayAttendance.filter(a => a.checkInTime);
  const checkOutList = todayAttendance.filter(a => a.checkOutTime);

  // ================= UI =================
  return (
    <div style={{ backgroundColor: "#F1FDF9" }} className="w-full h-screen flex flex-col p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            QR Attendance Marking
          </h1>
          <p className="text-[#9B9B9B] font-medium">
            Scan employee QR codes to record entry and exit
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex gap-3 mt-4 md:mt-0 bg-white p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab("checkin")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold ${
              activeTab === "checkin"
                ? "bg-[#02C39A] text-white"
                : "text-[#9B9B9B]"
            }`}
          >
            <LogIn size={16} /> Check-In
          </button>
          <button
            onClick={() => setActiveTab("checkout")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold ${
              activeTab === "checkout"
                ? "bg-[#05668D] text-white"
                : "text-[#9B9B9B]"
            }`}
          >
            <LogOut size={16} /> Check-Out
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

        {/* CAMERA */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Camera className="text-[#02C39A]" />
              <h2 className="text-lg font-bold">
                {isScanning ? "Scanning QR" : "Camera Ready"}
              </h2>
            </div>

            {/* START / STOP BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={startScanning}
                disabled={isScanning}
                className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2 bg-[#02C39A] text-white disabled:opacity-50"
              >
                <Play size={16} /> Start
              </button>

              <button
                onClick={stopScanning}
                disabled={!isScanning}
                className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2 bg-red-500 text-white disabled:opacity-50"
              >
                <Square size={16} /> Stop
              </button>
            </div>
          </div>

          <div className="relative bg-black h-[420px] rounded-lg flex items-center justify-center">
            {/* 🚨 PRODUCTION: ENABLE QR READER */}
            <div id="qr-reader" className="w-full h-full" />

            {result && (
              <div className={`absolute inset-0 flex items-center justify-center ${
                result.success ? "bg-green-600/90" : "bg-red-600/90"
              }`}>
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-3">
                    {result.success
                      ? <Check className="text-green-500" />
                      : <X className="text-red-500" />}
                  </div>
                  <h3 className="text-xl font-bold">{result.message}</h3>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ATTENDANCE LIST */}
        <div className="lg:col-span-1">
          {activeTab === "checkin" ? (
            <TodayAttendanceList
              title="Today's Check-In"
              data={checkInList}
              mode="checkin"
            />
          ) : (
            <TodayAttendanceList
              title="Today's Check-Out"
              data={checkOutList}
              mode="checkout"
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default QrAttendanceMarking;
