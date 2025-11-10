import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  // User data
  user: null,
  token: null,
  isAuthenticated: false,
  
  // Loading states - ADD THESE MISSING STATES
  isLoading: false,
  isSignupLoading: false,
  isModuleConfigLoading: false,
  
  // Error states
  error: null,
  
  // Module configuration
  availableModules: {
    // Basic modules (always true)
    employeeManagement: true,
    payrollManagement: true,
    leaveManagement: true,
    attendanceManagement: true,
    reportGeneration: true,
    adminActivityTracking: true,
    notificationSystem: true,
    basicDashboard: true,
    
    // Extended modules (based on org selection)
    performanceTracking: false,
    employeeFeedback: false,
    hiringManagement: false,
  }
};

// Async Thunks
export const signupOrganization = createAsyncThunk(
  'auth/signupOrganization',
  async (signupData, { rejectWithValue }) => {
    try {
      const response = await authApi.signupOrganization(signupData);
      
      if (response.success) {
        toast.success(response.message);
        return response.data;
      } else {
        toast.error(response.message);
        return rejectWithValue(response.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await authApi.loginUser(loginData);
      
      // Backend returns: { success: true, data: LoginResponse }
      toast.success('Login successful! Welcome to CoreHive.');
      return response; // Return the LoginResponse object directly
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Configure modules thunk - FIXED VERSION
export const configureModules = createAsyncThunk(
  'auth/configureModules',
  async (moduleConfig, { rejectWithValue }) => {
    try {
      console.log('⚙️ Configuring modules:', moduleConfig);
      
      const response = await authApi.configureModules(moduleConfig);
      
      if (response.success) {
        toast.success('Modules configured successfully!');
        
        // Update user data in localStorage with modules configured flag
        const storedUser = JSON.parse(localStorage.getItem('corehive_user') || '{}');
        storedUser.modulesConfigured = true;
        storedUser.moduleConfig = {
          ...storedUser.moduleConfig,
          // Basic modules (always enabled)
          employeeManagement: true,
          payrollManagement: true,
          leaveManagement: true,
          attendanceManagement: true,
          reportGeneration: true,
          adminActivityTracking: true,
          notificationSystem: true,
          basicDashboard: true,
          // Extended modules from configuration
          performanceTracking: moduleConfig.modulePerformanceTracking,
          employeeFeedback: moduleConfig.moduleEmployeeFeedback,
          hiringManagement: moduleConfig.moduleHiringManagement
        };
        localStorage.setItem('corehive_user', JSON.stringify(storedUser));
        
        return moduleConfig;
      } else {
        toast.error(response.message);
        return rejectWithValue(response.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Module configuration failed. Please try again.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get user details.';
      return rejectWithValue(message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = authApi.getStoredToken();
      const user = authApi.getStoredUser();
      
      if (token && user) {
        const response = await authApi.getCurrentUser();
        if (response.success) {
          return { token, user: response.data };
        }
      }
      
      return rejectWithValue('No valid authentication found');
    } catch (error) {
      authApi.logoutUser();
      return rejectWithValue('Invalid authentication');
    }
  }
);

// Auth Slice Definition
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.availableModules = initialState.availableModules;
      authApi.logoutUser();
    },
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('corehive_user', JSON.stringify(state.user));
      }
    },
    
    resetLoadingStates: (state) => {
      state.isLoading = false;
      state.isSignupLoading = false;
      state.isModuleConfigLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        
        if (action.payload.user.moduleConfig) {
          state.availableModules = {
            ...initialState.availableModules,
            ...action.payload.user.moduleConfig
          };
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Organization Signup
      .addCase(signupOrganization.pending, (state) => {
        state.isSignupLoading = true;
        state.error = null;
      })
      .addCase(signupOrganization.fulfilled, (state) => {
        state.isSignupLoading = false;
      })
      .addCase(signupOrganization.rejected, (state, action) => {
        state.isSignupLoading = false;
        state.error = action.payload;
      })
      
      // User Login - UPDATED VERSION
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Backend response structure: { success: true, data: LoginResponse }
        const loginData = action.payload; // This should be the LoginResponse object directly
        
        state.token = loginData.token;
        state.user = {
          userId: loginData.userId,
          email: loginData.email,
          userType: loginData.userType,
          role: loginData.role,
          organizationUuid: loginData.organizationUuid,
          organizationName: loginData.organizationName,
          modulesConfigured: loginData.modulesConfigured,
          moduleConfig: loginData.moduleConfig
        };
        state.isAuthenticated = true;
        
        // Store in localStorage immediately
        if (loginData.token) {
          localStorage.setItem('corehive_token', loginData.token);
          localStorage.setItem('corehive_user', JSON.stringify(state.user));
          console.log('🔐 Token stored in localStorage:', loginData.token.substring(0, 20) + '...');
          console.log('👤 User data stored:', state.user);
        }
        
        // Update available modules
        if (loginData.moduleConfig) {
          state.availableModules = {
            ...initialState.availableModules,
            ...loginData.moduleConfig
          };
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Configure Modules
      .addCase(configureModules.pending, (state) => {
        state.isModuleConfigLoading = true;
        state.error = null;
      })
      .addCase(configureModules.fulfilled, (state, action) => {
        state.isModuleConfigLoading = false;
        
        if (state.user) {
          state.user.modulesConfigured = true;
          
          state.availableModules = {
            ...state.availableModules,
            ...action.payload
          };
        }
      })
      .addCase(configureModules.rejected, (state, action) => {
        state.isModuleConfigLoading = false;
        state.error = action.payload;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        
        if (action.payload.moduleConfig) {
          state.availableModules = {
            ...initialState.availableModules,
            ...action.payload.moduleConfig
          };
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError, logout, updateUser, resetLoadingStates } = authSlice.actions;

// Export selectors - ADD MISSING SELECTORS
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserType = (state) => state.auth.user?.userType;
export const selectAvailableModules = (state) => state.auth.availableModules;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsSignupLoading = (state) => state.auth.isSignupLoading; // MISSING
export const selectIsModuleConfigLoading = (state) => state.auth.isModuleConfigLoading; // MISSING
export const selectError = (state) => state.auth.error;

// Export reducer
export default authSlice.reducer;