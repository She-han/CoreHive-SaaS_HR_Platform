import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode"; // The library for QR code scanning using camera
import {
  LogIn,
  LogOut,
  Camera,
  Play,
  Square,
  Check,
  X,
  ShieldCheck
} from "lucide-react";
import TodayAttendanceList from "../../components/attendance/TodayAttendanceList";

// ================= CONFIG =================
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ================= AUTH HELPER =================
const getAuthToken = () =>
  localStorage.getItem("corehive_token") ||
  sessionStorage.getItem("corehive_token");

const QrAttendanceMarking = () => {
  const scannerRef = useRef(null); // Reference to the Html5Qrcode scanner instance
  const scannedOnceRef = useRef(false); // To prevent multiple scans of one QR code

  // ================= STATE VARIABLES =================
  const [activeTab, setActiveTab] = useState("checkin"); //Current active tab (checkin / checkout)
  const [isScanning, setIsScanning] = useState(false); // Whether the camera is currently scanning or not
  const [result, setResult] = useState(null); //QR scan result (success / error message)
  const [todayAttendance, setTodayAttendance] = useState([]); //// Today's attendance records
  const [showDownloadModal, setShowDownloadModal] = useState(false); // Download QR modal visibility
  const [employeeCode, setEmployeeCode] = useState(""); // Employee code for QR download
  const [downloading, setDownloading] = useState(false); // Downloading state for QR code
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null); // QR preview image URL
  const [previewLoading, setPreviewLoading] = useState(false); // Preview loading state

  //================= EFFECTS =================
  // Fetch today's attendance when component mounts
  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // Cleanup when page leaving
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  // Open download modal when Download tab is selected
  useEffect(() => {
    if (activeTab === "download") {
      setShowDownloadModal(true);
    }
  }, [activeTab]);

  // Fetch today's attendance records from the server
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

  // Start the QR code scanning process using the device camera ON
  const startScanning = async () => {
    if (isScanning) return;
    setResult(null);
    scannedOnceRef.current = false;
    setIsScanning(true);

    const qr = new Html5Qrcode("qr-reader"); // Create scanner instance
    scannerRef.current = qr;

    try {
      await qr.start(
        { facingMode: "environment" }, // Use rear camera if available
        { fps: 15, qrbox: { width: 280, height: 280 } }, // Camera and QR code box settings(fps= frames per second)
        async (decodedText) => {
          if (scannedOnceRef.current) return; // Prevent multiple scans
          scannedOnceRef.current = true; // Mark as scanned

          // Stop the scanner after a successful scan
          await qr.stop();
          await qr.clear();
          scannerRef.current = null; // Clear scanner reference
          setIsScanning(false); // Update scanning state
          submitQr(decodedText); // Submit the scanned QR code for attendance marking
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera start failed", err);
      setIsScanning(false);
    }
  };

  // Stop the QR code scanning process manually
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

  // Submit the scanned QR code to the server for attendance marking
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
        body: JSON.stringify({ qrToken }) // Send the scanned QR token
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

  // Download the employee QR code as a PNG file
  const downloadEmployeeQr = async () => {
    if (!qrPreviewUrl) return;

    const a = document.createElement("a");
    a.href = qrPreviewUrl;
    a.download = `QR-${employeeCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Cleanup & close modal
    URL.revokeObjectURL(qrPreviewUrl);
    setQrPreviewUrl(null);
    setEmployeeCode("");
    setShowDownloadModal(false);
    setActiveTab("checkin");
  };

  // Fetch QR image and show preview (without downloading)
  const previewEmployeeQr = async () => {
    if (!employeeCode) return;

    try {
      setPreviewLoading(true);
      const token = getAuthToken();

      const res = await fetch(
        `${API_BASE}/employees/qr/by-code/${employeeCode}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to load QR preview");
      }

      // Convert response to image URL
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setQrPreviewUrl(url); // set preview image
    } catch (err) {
      alert("Invalid employee code or QR not found");
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Filter today's attendance into check-in and check-out lists
  const checkInList = todayAttendance.filter((a) => a.checkInTime);
  const checkOutList = todayAttendance.filter((a) => a.checkOutTime);

  return (
    <div className="w-full min-h-screen flex flex-col p-6 lg:p-10 bg-[#F1FDF9] text-[#333333]">
      {/* Main page container with full height and responsive padding */}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            QR Attendance Marking
          </h1>
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
          <button
            onClick={() => setActiveTab("download")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all duration-200 ${
              activeTab === "download"
                ? "bg-[#0C397A] text-white shadow-md"
                : "text-[#9B9B9B] hover:bg-[#F1FDF9]"
            }`}
          >
            <ShieldCheck size={18} /> Download QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {activeTab !== "download" && (
          <>
            {/* SCANNER VIEWPORT (COL-8) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-white rounded-3xl shadow-xl border border-[#9B9B9B]/10 overflow-hidden flex flex-col h-full">
                {/* SCANNER HEADER */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${isScanning ? "bg-red-500 animate-pulse" : "bg-gray-300"}`}
                    />
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
                  <div
                    id="qr-reader"
                    className="w-full h-full overflow-hidden"
                  />

                  {!isScanning && !result && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                      <Camera size={64} strokeWidth={1} className="mb-4" />
                      <p className="font-medium">
                        Click "Start Camera" to begin scanning
                      </p>
                    </div>
                  )}

                  {/* OVERLAY RESULTS */}
                  {result && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center z-10 animate-in fade-in zoom-in duration-300 ${
                        result.success ? "bg-[#02C39A]/95" : "bg-red-600/95"
                      }`}
                    >
                      <div className="text-center text-white p-8">
                        <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 shadow-2xl">
                          {result.success ? (
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
                          {result.success ? "VERIFIED" : "ACCESS DENIED"}
                        </h3>
                        <p className="text-lg opacity-90 font-medium">
                          {result.message}
                        </p>
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
          </>
        )}

        {activeTab === "download" && showDownloadModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-300">
              <h2 className="text-xl font-bold text-[#333333] mb-4">
                Download Employee QR
              </h2>

              {/* Employee Code Input */}
              <input
                type="text"
                placeholder="Enter Employee Code"
                value={employeeCode}
                onChange={(e) => {
                  setEmployeeCode(e.target.value);
                  setQrPreviewUrl(null); // reset preview on change
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#02C39A]"
              />

              {/* QR PREVIEW AREA */}
              <div className="border rounded-xl p-4 mb-4 flex flex-col items-center justify-center bg-[#F1FDF9]">
                {previewLoading && (
                  <p className="text-gray-500 font-medium">
                    Loading QR preview...
                  </p>
                )}

                {!previewLoading && qrPreviewUrl && (
                  <>
                    <img
                      src={qrPreviewUrl}
                      alt="QR Preview"
                      className="w-48 h-48 mb-3 rounded-lg shadow-lg"
                    />
                    <p className="text-sm text-gray-600 font-medium">
                      Employee Code:{" "}
                      <span className="font-bold">{employeeCode}</span>
                    </p>
                  </>
                )}

                {!previewLoading && !qrPreviewUrl && (
                  <p className="text-gray-400 text-sm">
                    Enter employee code and click Preview
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDownloadModal(false);
                    setActiveTab("checkin");
                    setEmployeeCode("");
                    setQrPreviewUrl(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>

                {!qrPreviewUrl ? (
                  <button
                    onClick={previewEmployeeQr}
                    disabled={!employeeCode || previewLoading}
                    className="px-5 py-2 rounded-lg bg-[#0C397A] text-white font-bold hover:bg-[#092f5c] disabled:opacity-50"
                  >
                    {previewLoading ? "Previewing..." : "Preview QR"}
                  </button>
                ) : (
                  <button
                    onClick={downloadEmployeeQr}
                    className="px-5 py-2 rounded-lg bg-[#02C39A] text-white font-bold hover:bg-[#1ED292]"
                  >
                    Download QR
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrAttendanceMarking;
