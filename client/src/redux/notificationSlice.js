import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data.data.count;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch unread count"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { incrementUnreadCount, decrementUnreadCount, resetUnreadCount, setUnreadCount } = notificationSlice.actions;

export default notificationSlice.reducer;
