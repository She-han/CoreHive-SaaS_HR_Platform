import apiClient from "./axios";

const BASE_URL = "/support-tickets";

/**
 * Create a new support ticket
 * @param {Object} ticketData - { ticketType, priority, subject, description }
 */
export const createSupportTicket = async (ticketData) => {
  try {
    const response = await apiClient.post(BASE_URL, ticketData);
    return {
      status: response.data.code === 201 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all tickets (System Admin only)
 */
export const getAllTickets = async (page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`${BASE_URL}?page=${page}&size=${size}`);
    // Backend returns StandardResponse { code, message, data }
    // data is a Page<SupportTicketResponseDTO> object
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data // Page object with content, totalPages, etc.
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get tickets by type
 */
export const getTicketsByType = async (type, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/type/${type}?page=${page}&size=${size}`);
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get tickets by status
 */
export const getTicketsByStatus = async (status, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/status/${status}?page=${page}&size=${size}`);
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get user's own tickets
 */
export const getMyTickets = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/my-tickets`);
    // Backend returns StandardResponse { code, message, data }
    // data is a List<SupportTicketResponseDTO>
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data // Array of tickets
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Search tickets
 */
export const searchTickets = async (query, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/search?query=${query}&page=${page}&size=${size}`);
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get ticket by ID
 */
export const getTicketById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark ticket as read
 */
export const markTicketAsRead = async (id) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/${id}/mark-read`);
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Reply to ticket
 */
export const replyToTicket = async (id, reply) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/${id}/reply`, { reply });
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/${id}/status`, { status });
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/unread-count`);
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete ticket
 */
export const deleteTicket = async (id) => {
  try {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return {
      status: response.data.code === 200 ? "success" : "error",
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};
