import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import adminSlice from './slices/adminSlice';

/**
 * Redux Store Configuration
 * Global state management සඳහා
 */
export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types for serialization checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV, // Redux DevTools development mode එකේ විතරක්
});

export default store;