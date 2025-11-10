import { createSlice } from '@reduxjs/toolkit';

/**
 * UI Slice
 * Global UI state management (modals, notifications, loading states etc.)
 */
const initialState = {
  // Global loading state
  isGlobalLoading: false,
  
  // Notification state
  notifications: [],
  
  // Modal states
  modals: {
    moduleConfig: false,
    userProfile: false,
    confirmDelete: false,
  },
  
  // Sidebar state (for dashboard layouts)
  sidebarOpen: false,
  
  // Theme and preferences
  theme: 'light',
  
  // Error boundary
  hasError: false,
  errorMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Global loading
    setGlobalLoading: (state, action) => {
      state.isGlobalLoading = action.payload;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'info',
        title: '',
        message: '',
        autoClose: true,
        duration: 5000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      state.modals[modalName] = { open: true, data };
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = { open: false, data: null };
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        state.modals[modalName] = { open: false, data: null };
      });
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Error boundary
    setError: (state, action) => {
      state.hasError = true;
      state.errorMessage = action.payload;
    },
    
    clearError: (state) => {
      state.hasError = false;
      state.errorMessage = null;
    },
  },
});

// Export actions
export const {
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearAllNotifications,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setError,
  clearError,
} = uiSlice.actions;

// Export selectors
export const selectUI = (state) => state.ui;
export const selectIsGlobalLoading = (state) => state.ui.isGlobalLoading;
export const selectNotifications = (state) => state.ui.notifications;
export const selectModals = (state) => state.ui.modals;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectHasError = (state) => state.ui.hasError;

// Export reducer
export default uiSlice.reducer;