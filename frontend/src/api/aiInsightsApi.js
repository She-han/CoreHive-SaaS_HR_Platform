/**
 * AI Insights API Module
 * 
 * This module handles all API calls to the AI Service.
 * It uses axios to make HTTP requests with proper authentication headers.
 */

import axios from 'axios';

// Get AI Service URL from environment variable
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';

// Create axios instance for AI Service
const aiApi = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 30000, // 30 seconds timeout (AI responses can take time)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if available
aiApi.interceptors.request.use(
    (config) => {
        // Get token from localStorage (if you're using JWT auth)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
aiApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log error for debugging
        console.error('AI Service Error:', error.response?.data || error.message);
        
        // Handle specific error cases
        if (error.response?.status === 503) {
            error.message = 'AI Service is temporarily unavailable. Please try again later.';
        } else if (error.response?.status === 429) {
            error.message = 'Too many requests. Please wait a moment.';
        } else if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. AI is processing, please try again.';
        }
        
        return Promise.reject(error);
    }
);

/**
 * AI Insights API Functions
 */
const aiInsightsApi = {
    /**
     * Get AI-generated dashboard insights
     * 
     * @param {string} organizationUuid - The organization's UUID
     * @returns {Promise<Object>} - Dashboard insights response
     */
    getDashboardInsights: async (organizationUuid) => {
        try {
            const response = await aiApi.get('/api/insights/dashboard', {
                headers: {
                    'X-Organization-UUID': organizationUuid,
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get attendance-specific analytics
     * 
     * @param {string} organizationUuid - The organization's UUID
     * @param {number} days - Number of days to analyze (default: 30)
     * @returns {Promise<Object>} - Attendance analytics response
     */
    getAttendanceInsights: async (organizationUuid, days = 30) => {
        try {
            const response = await aiApi.get('/api/insights/attendance', {
                headers: {
                    'X-Organization-UUID': organizationUuid,
                },
                params: { days },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get leave-specific analytics
     * 
     * @param {string} organizationUuid - The organization's UUID
     * @param {number} days - Number of days to analyze (default: 30)
     * @returns {Promise<Object>} - Leave analytics response
     */
    getLeaveInsights: async (organizationUuid, days = 30) => {
        try {
            const response = await aiApi.get('/api/insights/leaves', {
                headers: {
                    'X-Organization-UUID': organizationUuid,
                },
                params: { days },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get employee statistics
     * 
     * @param {string} organizationUuid - The organization's UUID
     * @returns {Promise<Object>} - Employee stats response
     */
    getEmployeeStats: async (organizationUuid) => {
        try {
            const response = await aiApi.get('/api/insights/employees', {
                headers: {
                    'X-Organization-UUID': organizationUuid,
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Check AI Service health status
     * 
     * @returns {Promise<Object>} - Health check response
     */
    checkHealth: async () => {
        try {
            const response = await aiApi.get('/health');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default aiInsightsApi;