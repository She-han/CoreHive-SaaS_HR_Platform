/**
 * Face Recognition API - Complete Implementation
 * Connects to Python AI Service + Java Backend
 */

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
// FIX: Use environment variable for backend URL
const JAVA_BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
 * Identify face (Kiosk mode - find which employee)
 */
export const identifyFace = async (organizationUuid, imageBlob) => {
  const formData = new FormData();
  formData.append('organization_uuid', organizationUuid);
  formData.append('image', imageBlob, 'live.jpg');

  const response = await fetch(`${AI_SERVICE_URL}/api/face/identify`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'Face identification failed');
  }
  
  return data;
};

/**
 * Verify face only (Python AI) - for specific employee
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
 * Mark CHECK-IN in database (after face identified)
 */
export const markCheckIn = async (employeeId, organizationUuid, verificationConfidence) => {
  const token = getAuthToken();
  
  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: employeeId,
      organizationUuid: organizationUuid,
      verificationConfidence: verificationConfidence,
      deviceInfo: navigator.userAgent
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save check-in');
  }
  
  return data;
};

/**
 * Mark CHECK-OUT in database (after face identified)
 */
export const markCheckOut = async (employeeId, organizationUuid, verificationConfidence) => {
  const token = getAuthToken();
  
  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/check-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: employeeId,
      organizationUuid: organizationUuid,
      verificationConfidence: verificationConfidence,
      deviceInfo: navigator.userAgent
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save check-out');
  }
  
  return data;
};

/**
 * Mark attendance in database (legacy - auto check-in/out)
 */
export const markAttendanceInDatabase = async (employeeId, organizationUuid, verificationConfidence) => {
  const token = getAuthToken();
  
  const response = await fetch(`${JAVA_BACKEND_URL}/attendance/mark-face`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeId: employeeId,
      organizationUuid: organizationUuid,
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
 * COMPLETE FLOW: Identify Face + Mark Attendance (CHECK-IN)
 * 1. Python AI identify face
 * 2. If success, Java Backend save attendance
 */
export const identifyAndCheckIn = async (organizationUuid, base64Image) => {
  try {
    const imageBlob = base64ToBlob(base64Image);

    // Step 1: Identify face with Python AI
    console.log('Step 1: Identifying face...');
    const identifyResult = await identifyFace(organizationUuid, imageBlob);

    if (!identifyResult.identified) {
      return {
        success: false,
        step: 'identification',
        identified: false,
        message: identifyResult.message || 'Face not recognized',
        similarity: identifyResult.similarity
      };
    }

    console.log('Step 1 Complete: Face identified!', identifyResult.employee_id, identifyResult.similarity);

    // Step 2: Save check-in in Java Backend
    console.log('Step 2: Saving check-in...');
    const attendanceResult = await markCheckIn(
      identifyResult.employee_id,
      organizationUuid,
      identifyResult.similarity_percent || `${(identifyResult.similarity * 100).toFixed(1)}%`
    );

    console.log('Step 2 Complete: Check-in saved!', attendanceResult);

    return {
      success: true,
      step: 'complete',
      identified: true,
      employeeId: identifyResult.employee_id,
      similarity: identifyResult.similarity,
      message: attendanceResult.message || 'Check-in successful!',
      data: {
        identification: identifyResult,
        attendance: attendanceResult
      }
    };

  } catch (error) {
    console.error('Check-in error:', error);
    return {
      success: false,
      step: 'error',
      identified: false,
      message: error.message || 'Failed to mark check-in',
      error: error
    };
  }
};

/**
 * COMPLETE FLOW: Identify Face + Mark CHECK-OUT
 */
export const identifyAndCheckOut = async (organizationUuid, base64Image) => {
  try {
    const imageBlob = base64ToBlob(base64Image);

    // Step 1: Identify face
    console.log('Step 1: Identifying face for checkout...');
    const identifyResult = await identifyFace(organizationUuid, imageBlob);

    if (!identifyResult.identified) {
      return {
        success: false,
        step: 'identification',
        identified: false,
        message: identifyResult.message || 'Face not recognized'
      };
    }

    console.log('Step 1 Complete: Face identified!', identifyResult.employee_id);

    // Step 2: Save check-out
    console.log('Step 2: Saving check-out...');
    const attendanceResult = await markCheckOut(
      identifyResult.employee_id,
      organizationUuid,
      identifyResult.similarity_percent || `${(identifyResult.similarity * 100).toFixed(1)}%`
    );

    console.log('Step 2 Complete: Check-out saved!', attendanceResult);

    return {
      success: true,
      step: 'complete',
      identified: true,
      employeeId: identifyResult.employee_id,
      message: attendanceResult.message || 'Check-out successful!',
      data: {
        identification: identifyResult,
        attendance: attendanceResult
      }
    };

  } catch (error) {
    console.error('Check-out error:', error);
    return {
      success: false,
      step: 'error',
      identified: false,
      message: error.message || 'Failed to mark check-out',
      error: error
    };
  }
};

/**
 * LEGACY: Verify Face + Mark Attendance (auto check-in/out)
 */
export const verifyAndMarkAttendance = async (employeeId, organizationUuid, base64Image) => {
  try {
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
        similarity: verifyResult.similarity
      };
    }

    console.log('Step 1 Complete: Face verified!', verifyResult.similarity);

    // Step 2: Save attendance in Java Backend
    console.log('Step 2: Saving attendance...');
    const attendanceResult = await markAttendanceInDatabase(
      employeeId,
      organizationUuid,
      verifyResult.similarity_percent || `${(verifyResult.similarity * 100).toFixed(1)}%`
    );

    console.log('Step 2 Complete: Attendance saved!', attendanceResult);

    return {
      success: true,
      step: 'complete',
      verified: true,
      message: attendanceResult.message || 'Attendance marked successfully!',
      data: {
        verification: verifyResult,
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