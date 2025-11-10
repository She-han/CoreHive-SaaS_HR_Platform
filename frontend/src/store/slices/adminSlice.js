import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../api/adminApi';
import toast from 'react-hot-toast';

/**
 * Admin Slice
 * System Admin operations state management
 */

// Initial state
const initialState = {
  // Organizations data
  pendingApprovals: [],
  allOrganizations: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0
  },
  
  // Platform statistics
  platformStats: {
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    totalEmployees: 0
  },
  
  // Loading states
  isLoading: false,
  isApprovalsLoading: false,
  isOrganizationsLoading: false,
  isStatsLoading: false,
  
  // Error states
  error: null,
  
  // UI states
  selectedOrganization: null,
  filters: {
    status: 'ALL',
    searchTerm: '',
    sortBy: 'createdAt',
    sortDir: 'desc'
  }
};

/**
 * Async Thunks
 */

// Fetch pending approvals
export const fetchPendingApprovals = createAsyncThunk(
  'admin/fetchPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingApprovals();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending approvals');
    }
  }
);

// Fetch all organizations
export const fetchAllOrganizations = createAsyncThunk(
  'admin/fetchAllOrganizations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllOrganizations(params);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch organizations');
    }
  }
);

// Approve organization
export const approveOrganization = createAsyncThunk(
  'admin/approveOrganization',
  async (organizationUuid, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminApi.approveOrganization(organizationUuid);
      if (response.success) {
        toast.success('Organization approved successfully!');
        // Refresh pending approvals
        dispatch(fetchPendingApprovals());
        return organizationUuid;
      } else {
        toast.error(response.message);
        return rejectWithValue(response.message);
      }
    } catch (error) {
      const message = error.message || 'Failed to approve organization';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Reject organization
export const rejectOrganization = createAsyncThunk(
  'admin/rejectOrganization',
  async (organizationUuid, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminApi.rejectOrganization(organizationUuid);
      if (response.success) {
        toast.success('Organization rejected successfully!');
        // Refresh pending approvals
        dispatch(fetchPendingApprovals());
        return organizationUuid;
      } else {
        toast.error(response.message);
        return rejectWithValue(response.message);
      }
    } catch (error) {
      const message = error.message || 'Failed to reject organization';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Change organization status
export const changeOrganizationStatus = createAsyncThunk(
  'admin/changeOrganizationStatus',
  async ({ organizationUuid, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminApi.changeOrganizationStatus(organizationUuid, status);
      if (response.success) {
        toast.success(`Organization status changed to ${status.toLowerCase()}!`);
        // Refresh organizations list
        dispatch(fetchAllOrganizations());
        return { organizationUuid, status };
      } else {
        toast.error(response.message);
        return rejectWithValue(response.message);
      }
    } catch (error) {
      const message = error.message || 'Failed to change organization status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Fetch platform statistics
export const fetchPlatformStatistics = createAsyncThunk(
  'admin/fetchPlatformStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPlatformStatistics();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch platform statistics');
    }
  }
);

/**
 * Admin Slice Definition
 */
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set selected organization
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Reset admin state
    resetAdminState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pending Approvals
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.isApprovalsLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.isApprovalsLoading = false;
        state.pendingApprovals = action.payload;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.isApprovalsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch All Organizations
      .addCase(fetchAllOrganizations.pending, (state) => {
        state.isOrganizationsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrganizations.fulfilled, (state, action) => {
        state.isOrganizationsLoading = false;
        state.allOrganizations = action.payload;
      })
      .addCase(fetchAllOrganizations.rejected, (state, action) => {
        state.isOrganizationsLoading = false;
        state.error = action.payload;
      })
      
      // Approve Organization
      .addCase(approveOrganization.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from pending approvals
        state.pendingApprovals = state.pendingApprovals.filter(
          org => org.organizationUuid !== action.payload
        );
      })
      .addCase(approveOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reject Organization
      .addCase(rejectOrganization.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rejectOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from pending approvals
        state.pendingApprovals = state.pendingApprovals.filter(
          org => org.organizationUuid !== action.payload
        );
      })
      .addCase(rejectOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Change Organization Status
      .addCase(changeOrganizationStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changeOrganizationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update organization status in the list
        const { organizationUuid, status } = action.payload;
        const orgIndex = state.allOrganizations.content.findIndex(
          org => org.organizationUuid === organizationUuid
        );
        if (orgIndex !== -1) {
          state.allOrganizations.content[orgIndex].status = status;
        }
      })
      .addCase(changeOrganizationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Platform Statistics
      .addCase(fetchPlatformStatistics.pending, (state) => {
        state.isStatsLoading = true;
        state.error = null;
      })
      .addCase(fetchPlatformStatistics.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.platformStats = action.payload;
      })
      .addCase(fetchPlatformStatistics.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  clearError, 
  setSelectedOrganization, 
  updateFilters, 
  resetFilters,
  resetAdminState 
} = adminSlice.actions;

// Export selectors
export const selectAdmin = (state) => state.admin;
export const selectPendingApprovals = (state) => state.admin.pendingApprovals;
export const selectAllOrganizations = (state) => state.admin.allOrganizations;
export const selectPlatformStats = (state) => state.admin.platformStats;
export const selectIsAdminLoading = (state) => state.admin.isLoading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminFilters = (state) => state.admin.filters;

// Export reducer
export default adminSlice.reducer;