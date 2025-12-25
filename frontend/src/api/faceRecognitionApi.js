/**
 * Face Recognition API - Complete Implementation
 * Connects to Python AI Service + Java Backend
 */

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
const JAVA_BACKEND_URL = 'http://localhost:8080/api';

// ===== Helper Functions =====

const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

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

// ===== Python AI Service APIs =====

/**
 * Register employee face
 */
export const registerFace = async (employeeId, organizationUuid, imageBlob) => {
  const formData = new FormData();
  formData.append('employee_id', String(employeeId));
  formData.append('organization_uuid', organizationUuid);
  formData.append('image', imageBlob, 'face.jpg');

  const response = await fetch(`${AI_SERVICE_URL}/api/face/register`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'Face registration failed');
  }
  
  return data;
};

/**
 * Verify face only (Python AI)
 */
export const verifyFace = async (employeeId, organizationUuid, imageBlob) => {
  const formData = new FormData();
  formData.append('employee_id', String(employeeId));
  formData.append('organization_uuid', organizationUuid);
  formData.append('live_image', imageBlob, 'live.jpg');

  const response = await fetch(`${AI_SERVICE_URL}/api/face/verify`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'Face verification failed');
  }
  
  return data;
};

/**
 * Check face registration status
 */
export const checkFaceRegistrationStatus = async (employeeId, organizationUuid) => {
  const response = await fetch(
    `${AI_SERVICE_URL}/api/face/status/${organizationUuid}/${employeeId}`
  );
  return await response.json();
};

/**
 * Deregister face
 */
export const deregisterFace = async (employeeId, organizationUuid) => {
  const response = await fetch(
    `${AI_SERVICE_URL}/api/face/deregister/${organizationUuid}/${employeeId}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Deregistration failed');
  }
  
  return await response.json();
};

// ===== Java Backend APIs =====

/**
 * Mark attendance in database (after face verified)
 */
export const markAttendanceInDatabase = async (verificationConfidence) => {
  const token = getAuthToken();
  
  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/mark-face`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      verificationConfidence: verificationConfidence,
      deviceInfo: navigator.userAgent
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save attendance');
  }
  
  return data;
};

/**
 * Get today's attendance status
 */
export const getTodayAttendance = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/today`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

/**
 * Get attendance history
 */
export const getAttendanceHistory = async (startDate, endDate) => {
  const token = getAuthToken();
  
  let url = `${JAVA_BACKEND_URL}/attendance/history`;
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// ===== Complete Flow Functions =====

/**
 * COMPLETE FLOW: Verify Face + Mark Attendance
 * 1. Python AI verify face
 * 2. If success, Java Backend save attendance
 */
export const verifyAndMarkAttendance = async (employeeId, organizationUuid, base64Image) => {
  try {
    // Convert base64 to blob
    const imageBlob = base64ToBlob(base64Image);

    // Step 1: Verify face with Python AI
    console.log('Step 1: Verifying face...');
    const verifyResult = await verifyFace(employeeId, organizationUuid, imageBlob);

    if (!verifyResult.verified) {
      return {
        success: false,
        step: 'verification',
        verified: false,
        message: verifyResult.message || 'Face not matched',
        data: verifyResult.data
      };
    }

    console.log('Step 1 Complete: Face verified!', verifyResult.data?.confidence);

    // Step 2: Save attendance in Java Backend
    console.log('Step 2: Saving attendance...');
    const attendanceResult = await markAttendanceInDatabase(
      verifyResult.data?.confidence || 'N/A'
    );

    console.log('Step 2 Complete: Attendance saved!', attendanceResult);

    return {
      success: true,
      step: 'complete',
      verified: true,
      message: attendanceResult.message || 'Attendance marked successfully!',
      data: {
        verification: verifyResult.data,
        attendance: attendanceResult
      }
    };

  } catch (error) {
    console.error('Attendance marking error:', error);
    return {
      success: false,
      step: 'error',
      verified: false,
      message: error.message || 'Failed to mark attendance',
      error: error
    };
  }
};

/**
 * Register face from base64 image
 */
export const registerFaceFromBase64 = async (employeeId, organizationUuid, base64Image) => {
  try {
    const imageBlob = base64ToBlob(base64Image);
    return await registerFace(employeeId, organizationUuid, imageBlob);
  } catch (error) {
    console.error('Face registration error:', error);
    throw error;
  }
};

/**
 * Check AI service health
 */
export const checkFaceServiceHealth = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/face/health`);
    return await response.json();
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message,
      dependencies_installed: false 
    };
  }
};