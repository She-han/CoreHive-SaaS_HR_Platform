import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { LogIn, LogOut, Camera, Play, Square, Check, X, ShieldCheck } from "lucide-react";
import TodayAttendanceList from "../../components/attendance/TodayAttendanceList";

// ================= CONFIG =================
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ================= AUTH HELPER =================
const getAuthToken = () =>
  localStorage.getItem("corehive_token") ||
  sessionStorage.getItem("corehive_token");

const QrAttendanceMarking = () => {
  const scannerRef = useRef(null);
  const scannedOnceRef = useRef(false);

  const [activeTab, setActiveTab] = useState("checkin");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

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
      const json = await res.json();
      setTodayAttendance(Array.isArray(json) ? json : json.data || []);
    } catch (err) {
      console.error("Failed to load attendance", err);
    }
  };

  const startScanning = async () => {
    if (isScanning) return;
    setResult(null);
    scannedOnceRef.current = false;
    setIsScanning(true);

    const qr = new Html5Qrcode("qr-reader");
    scannerRef.current = qr;

    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 280, height: 280 } },
        async (decodedText) => {
          if (scannedOnceRef.current) return;
          scannedOnceRef.current = true;
          await qr.stop();
          await qr.clear();
          scannerRef.current = null;
          setIsScanning(false);
          submitQr(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera start failed", err);
      setIsScanning(false);
    }
  };

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

  const submitQr = async (qrToken) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_BASE}/attendance/qr/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken })
      });

      const data = await res.json();

      if (!res.ok || data.code !== 200) {
        setResult({
          success: false,
          message: data.message || "QR scan failed"
        });
        return;
      }

      setResult({
        success: true,
        message:
          data.data?.action === "CHECK_IN"
            ? "Check-in successful"
            : data.data?.action === "CHECK_OUT"
            ? "Check-out successful"
            : data.message,
        action: data.data?.action
      });

      fetchTodayAttendance();
      setTimeout(() => setResult(null), 4000);

    } catch (err) {
      setResult({
        success: false,
        message: err.message || "Unexpected error"
      });
    }
  };

  const checkInList = todayAttendance.filter(a => a.checkInTime);
  const checkOutList = todayAttendance.filter(a => a.checkOutTime);

  return (
    <div className="w-full min-h-screen flex flex-col p-6 lg:p-10 bg-[#F1FDF9] text-[#333333]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">QR Attendance Marking</h1>
          <p className="text-[#9B9B9B] font-medium">
            Scan employee QR codes to record entry and exit
          </p>
        </div>
        {/* TAB SWITCHER */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-[#9B9B9B]/20 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("checkin")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all duration-200 ${
              activeTab === "checkin"
                ? "bg-[#02C39A] text-white shadow-md"
                : "text-[#9B9B9B] hover:bg-[#F1FDF9]"
            }`}
          >
            <LogIn size={18} /> Check-In
          </button>
          <button
            onClick={() => setActiveTab("checkout")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all duration-200 ${
              activeTab === "checkout"
                ? "bg-[#05668D] text-white shadow-md"
                : "text-[#9B9B9B] hover:bg-[#F1FDF9]"
            }`}
          >
            <LogOut size={18} /> Check-Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* SCANNER VIEWPORT (COL-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-3xl shadow-xl border border-[#9B9B9B]/10 overflow-hidden flex flex-col h-full">
            
            {/* SCANNER HEADER */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                <h2 className="font-bold text-[#333333] uppercase tracking-wider text-sm">
                  {isScanning ? "Live Scanner Active" : "Scanner Standby"}
                </h2>
              </div>
              
              <div className="flex gap-3">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    className="flex items-center gap-2 bg-[#1ED292] hover:bg-[#02C39A] text-white px-6 py-2 rounded-xl font-bold transition-all transform active:scale-95"
                  >
                    <Play size={16} fill="currentColor" /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex items-center gap-2 bg-[#333333] hover:bg-black text-white px-6 py-2 rounded-xl font-bold transition-all transform active:scale-95"
                  >
                    <Square size={16} fill="currentColor" /> Stop
                  </button>
                )}
              </div>
            </div>

            {/* CAMERA STAGE */}
            <div className="relative bg-[#0C397A] flex-1 min-h-[450px] flex items-center justify-center">
              <div id="qr-reader" className="w-full h-full overflow-hidden" />
              
              {!isScanning && !result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                  <Camera size={64} strokeWidth={1} className="mb-4" />
                  <p className="font-medium">Click "Start Camera" to begin scanning</p>
                </div>
              )}

              {/* OVERLAY RESULTS */}
              {result && (
                <div className={`absolute inset-0 flex items-center justify-center z-10 animate-in fade-in zoom-in duration-300 ${
                  result.success ? "bg-[#02C39A]/95" : "bg-red-600/95"
                }`}>
                  <div className="text-center text-white p-8">
                    <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 shadow-2xl">
                      {result.success ? (
                        <Check size={48} className="text-[#02C39A]" strokeWidth={3} />
                      ) : (
                        <X size={48} className="text-red-500" strokeWidth={3} />
                      )}
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight">
                      {result.success ? "VERIFIED" : "ACCESS DENIED"}
                    </h3>
                    <p className="text-lg opacity-90 font-medium">{result.message}</p>
                    <button 
                      onClick={() => setResult(null)}
                      className="mt-8 px-6 py-2 border-2 border-white/50 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECENT LOGS (COL-4) */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white rounded-3xl shadow-xl border border-[#9B9B9B]/10 overflow-hidden h-full flex flex-col">
            <div className="p-1 h-full overflow-auto custom-scrollbar">
              <TodayAttendanceList
                title={
                  activeTab === "checkin"
                    ? "Check-In Logs"
                    : "Check-Out Logs"
                }
                data={activeTab === "checkin" ? checkInList : checkOutList}
                mode={activeTab}
              />
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default QrAttendanceMarking;