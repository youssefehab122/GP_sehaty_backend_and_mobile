import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistAPI } from "../../services/api";

// Async thunk for fetching wishlist items
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlist();
      return response.items || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding item to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (medicineId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.addToWishlist(medicineId);
      return response;
    } catch (error) {
      if (error.response?.data?.message?.includes('already in wishlist')) {
        // If item is already in wishlist, try to remove it
        try {
          await wishlistAPI.removeFromWishlist(medicineId);
          return { medicineId, action: 'remove' };
        } catch (removeError) {
          return rejectWithValue(removeError.message);
        }
      }
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for removing item from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (medicineId, { rejectWithValue }) => {
    try {
      await wishlistAPI.removeFromWishlist(medicineId);
      return medicineId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.action === 'remove') {
          // If the item was already in wishlist, remove it
          state.items = state.items.filter(item => item.medicineId !== action.payload.medicineId);
        } else {
          // Add new item if it doesn't exist
          const exists = state.items.some(item => item.medicineId === action.payload.medicineId);
          if (!exists) {
            state.items.push(action.payload);
          }
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.medicineId !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
