// src/api/noticeService.js
import apiClient from "./axios";

/**
 * Get all notices (paginated)
 */
export const getAllNotices = async (page = 0, size = 10) => {
  try {
    const res = await apiClient.get(
      `/notices?page=${page}&size=${size}`
    );
    return res.data.data; // Page<NoticeResponseDTO>
  } catch (err) {
    console.error("Error fetching notices", err);
    throw err;
  }
};

/**
 * Create notice
 */
export const createNotice = async (payload) => {
  try {
    const res = await apiClient.post("/notices", payload);
    return res.data.data;
  } catch (err) {
    console.error("Error creating notice", err);
    throw err;
  }
};

/**
 * Update notice
 */
export const updateNotice = async (id, payload) => {
  const res = await apiClient.put(`/notices/${id}`, payload);
  return res.data.data;
};

/**
 * Delete notice
 */
export const deleteNotice = async (id) => {
  await apiClient.delete(`/notices/${id}`);
};
