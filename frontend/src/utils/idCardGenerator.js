import jsPDF from 'jspdf';

// ID Card dimensions (standard CR80 card size in mm)
const CARD_WIDTH = 85.6; // 3.375 inches
const CARD_HEIGHT = 53.98; // 2.125 inches

// Theme colors
const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
  background: '#F1FDF9',
  text: '#333333'
};

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Get auth token from storage
const getAuthToken = () => {
  return localStorage.getItem('corehive_token') || sessionStorage.getItem('corehive_token');
};

/**
 * Generate Employee ID Card PDF
 * @param {Object} employee - Employee data
 * @param {string} organizationName - Organization name
 * @param {string} photoPath - Path to employee photo
 * @returns {Promise<void>}
 */
export const generateEmployeeIDCard = async (employee, organizationName, photoPath = null) => {
  try {
    // Create PDF in landscape orientation for ID card
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [CARD_WIDTH, CARD_HEIGHT]
    });

    // Fetch QR code from backend using the same method as QRAttendancePage
    // This generates/retrieves the permanent QR token (e.g., "EMP-7IMAHD6ULB2O") 
    // and creates the QR code image from it
    const qrCodeDataUrl = await fetchEmployeeQRCode(employee.employeeCode);

    // Card background with gradient effect
    pdf.setFillColor(241, 253, 249); // #F1FDF9
    pdf.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, 'F');

    // Header section with primary color
    pdf.setFillColor(2, 195, 154); // #02C39A
    pdf.rect(0, 0, CARD_WIDTH, 8, 'F');

    // Organization name in header
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(organizationName.toUpperCase(), CARD_WIDTH / 2, 5, { align: 'center' });

    // Employee Photo Section (Left side)
    const photoX = 5;
    const photoY = 12;
    const photoWidth = 20;
    const photoHeight = 25;

    // Photo border
    pdf.setDrawColor(5, 102, 141); // #05668D
    pdf.setLineWidth(0.5);
    pdf.rect(photoX, photoY, photoWidth, photoHeight);

    // Try to load employee photo
    if (photoPath) {
      try {
        // Convert file path to base64
        const photoBase64 = await loadImageAsBase64(photoPath);
        if (photoBase64) {
          pdf.addImage(photoBase64, 'JPEG', photoX, photoY, photoWidth, photoHeight);
        } else {
          // Placeholder if photo not found
          addPhotoPlaceholder(pdf, photoX, photoY, photoWidth, photoHeight);
        }
      } catch (error) {
        console.warn('Failed to load photo:', error);
        addPhotoPlaceholder(pdf, photoX, photoY, photoWidth, photoHeight);
      }
    } else {
      addPhotoPlaceholder(pdf, photoX, photoY, photoWidth, photoHeight);
    }

    // Employee Information Section (Right side)
    const infoX = 28;
    let currentY = 16;

    // Employee Name
    pdf.setTextColor(12, 57, 122); // #0C397A
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const fullName = `${employee.firstName} ${employee.lastName}`;
    pdf.text(fullName.toUpperCase(), infoX, currentY);
    currentY += 4;

    // Employee Code
    pdf.setTextColor(51, 51, 51); // #333333
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`(ID: ${employee.employeeCode})`, infoX, currentY);
    currentY += 4;

    // Contact Info
    if (employee.phone) {
      pdf.setFontSize(7);
      pdf.setTextColor(155, 155, 155); // #9B9B9B
      pdf.text(`${employee.phone}`, infoX, currentY);
      currentY += 6;
    }

    // Designation
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(12, 57, 122); // #05668D
    pdf.text(employee.designation || '', infoX, currentY);
    currentY += 4;



    // Department
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 51, 51);
    const departmentName = employee.departmentDTO?.name || employee.department || 'N/A';
    pdf.text(`Dept: ${departmentName}`, infoX, currentY);
    currentY += 4;



    // QR Code Section (Bottom Right)
    const qrSize = 15;
    const qrX = CARD_WIDTH - qrSize - 5;
    const qrY = CARD_HEIGHT - qrSize - 10;

    // QR Code border
    pdf.setDrawColor(2, 195, 154); // #02C39A
    pdf.setLineWidth(0.3);
    pdf.rect(qrX - 0.5, qrY - 0.5, qrSize + 1, qrSize + 1);

    // Add QR code
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // QR Code label
    pdf.setFontSize(6);
    pdf.setTextColor(51, 51, 51);
    pdf.text('Scan for Attendance', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });

    // Footer section
    const footerY = CARD_HEIGHT - 3;
    pdf.setFillColor(12, 57, 122); // #0C397A
    pdf.rect(0, CARD_HEIGHT - 5, CARD_WIDTH, 5, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(
      `Created for ${organizationName} by CoreHiveHR`,
      CARD_WIDTH / 2,
      footerY,
      { align: 'center' }
    );

    // Save PDF
    const fileName = `ID_Card_${employee.employeeCode}_${employee.firstName}_${employee.lastName}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating ID card:', error);
    throw error;
  }
};

/**
 * Add placeholder when photo is not available
 */
const addPhotoPlaceholder = (pdf, x, y, width, height) => {
  pdf.setFillColor(220, 220, 220);
  pdf.rect(x, y, width, height, 'F');

  pdf.setTextColor(155, 155, 155);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('No Photo', x + width / 2, y + height / 2, { align: 'center' });
};

/**
 * Fetch employee QR code from backend
 * Uses the same endpoint as QRAttendancePage to ensure consistency
 * This generates a permanent QR token (e.g., "EMP-7IMAHD6ULB2O") and saves it to the employee table
 * @param {string} employeeCode - Employee code (e.g., "66")
 * @returns {Promise<string>} Base64 encoded QR code image
 */
const fetchEmployeeQRCode = async (employeeCode) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Call the same endpoint used in QRAttendancePage for downloading QR codes
    const response = await fetch(`${API_BASE}/employees/qr/by-code/${employeeCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch QR code: ${response.status}`);
    }

    // Convert PNG blob to base64
    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Error fetching employee QR code:', error);
    throw error;
  }
};

/**
 * Load image from URL or file path as base64
 * Note: For production, this should be handled by backend API
 */
const loadImageAsBase64 = async (photoPath) => {
  try {
    // If photoPath is already a base64 string or URL
    if (photoPath.startsWith('data:') || photoPath.startsWith('http')) {
      return photoPath;
    }

    // For local file paths, you'd need a backend endpoint to serve the image
    // This is a placeholder - in production, create an API endpoint like:
    // GET /api/employees/{id}/photo that returns the image
    
    // Extract employee ID from path if possible
    // Example path: D:\...\uploads\employee_photos\{orgId}\{empId}.jpg
    const pathParts = photoPath.split(/[\\\/]/);
    const filename = pathParts[pathParts.length - 1];
    const empId = filename.split('.')[0];
    
    // Call backend to get photo as base64
    const response = await fetch(`${API_BASE}/employees/${empId}/photo`);
    if (response.ok) {
      const blob = await response.blob();
      return await blobToBase64(blob);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

/**
 * Convert Blob to Base64
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default {
  generateEmployeeIDCard
};
