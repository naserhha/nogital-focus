import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BlockedItem {
  id: string;
  userId: string;
  name: string;
  url?: string;
  packageName?: string; // for Android apps
  type: 'website' | 'app';
  isActive: boolean;
  createdAt: Date;
}

export interface BlockerState {
  blockedItems: BlockedItem[];
  isBlockingEnabled: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: BlockerState = {
  blockedItems: [],
  isBlockingEnabled: false,
  loading: false,
  error: null,
};

// Async thunks
export const addBlockedItem = createAsyncThunk(
  'blocker/addBlockedItem',
  async (item: Omit<BlockedItem, 'id' | 'userId' | 'createdAt'>) => {
    // This would call the blocker service
    return { ...item, id: Date.now().toString(), createdAt: new Date() } as BlockedItem;
  }
);

export const removeBlockedItem = createAsyncThunk(
  'blocker/removeBlockedItem',
  async (itemId: string) => {
    // This would call the blocker service
    return itemId;
  }
);

export const toggleBlocking = createAsyncThunk(
  'blocker/toggleBlocking',
  async (enabled: boolean) => {
    // This would call the blocker service
    return enabled;
  }
);

const blockerSlice = createSlice({
  name: 'blocker',
  initialState,
  reducers: {
    setBlockedItems: (state, action: PayloadAction<BlockedItem[]>) => {
      state.blockedItems = action.payload;
    },
    toggleItemActive: (state, action: PayloadAction<string>) => {
      const item = state.blockedItems.find(item => item.id === action.payload);
      if (item) {
        item.isActive = !item.isActive;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addBlockedItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBlockedItem.fulfilled, (state, action) => {
        state.loading = false;
        state.blockedItems.push(action.payload);
      })
      .addCase(addBlockedItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add blocked item';
      })
      .addCase(removeBlockedItem.fulfilled, (state, action) => {
        state.blockedItems = state.blockedItems.filter(item => item.id !== action.payload);
      })
      .addCase(toggleBlocking.fulfilled, (state, action) => {
        state.isBlockingEnabled = action.payload;
      });
  },
});

export const { setBlockedItems, toggleItemActive, clearError } = blockerSlice.actions;

export default blockerSlice.reducer; 