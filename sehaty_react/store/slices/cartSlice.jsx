// store/slices/cartSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartAPI } from '../../services/api';

// Fetch cart items from API
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      return response.items || [];
    } catch (error) {
      // If API fails, try to get from local storage as fallback
      try {
        const localCart = await AsyncStorage.getItem('@cart');
        return localCart ? JSON.parse(localCart) : [];
      } catch (localError) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item, { rejectWithValue, dispatch }) => {
    try {
      // If item has id and quantity, use them
      const medicineId = item.medicineId;
      const quantity = item.qty || 1;
      const pharmacyId = item.pharmacyId;
      
      const response = await cartAPI.addToCart(medicineId, quantity,pharmacyId);
      
      // Refresh cart after adding item
      dispatch(fetchCart());
      
      return response;
    } catch (error) {
      // If API fails, add to local cart
      try {
        const localCart = await AsyncStorage.getItem('@cart');
        const cartItems = localCart ? JSON.parse(localCart) : [];
        
        // Check if item already exists
        const existingItemIndex = cartItems.findIndex(cartItem => cartItem.medicineId === item.medicineId);
        
        if (existingItemIndex >= 0) {
          // Increase quantity if item exists
          cartItems[existingItemIndex].qty = (cartItems[existingItemIndex].qty || 1) + 1;
        } else {
          // Add new item with qty of 1
          cartItems.push({
            ...item,
            qty: 1
          });
        }
        
        await AsyncStorage.setItem('@cart', JSON.stringify(cartItems));
        return item;
      } catch (localError) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  }
);

// Update cart item quantity
export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, qty }, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartAPI.updateCartItem(id, qty);
      
      // Refresh cart after updating
      dispatch(fetchCart());
      
      return response;
    } catch (error) {
      // If API fails, update local cart
      try {
        const localCart = await AsyncStorage.getItem('@cart');
        const cartItems = localCart ? JSON.parse(localCart) : [];
        
        const updatedItems = cartItems.map(item => {
          if (item.id === id) {
            return { ...item, qty };
          }
          return item;
        }).filter(item => item.qty > 0);
        
        await AsyncStorage.setItem('@cart', JSON.stringify(updatedItems));
        return { id, qty };
      } catch (localError) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({medicineId,pharmacyId}, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartAPI.removeFromCart(medicineId,pharmacyId);
      
      // Refresh cart after removing item
      dispatch(fetchCart());
      
      return response;
    } catch (error) {
      // If API fails, remove from local cart
      try {
        const localCart = await AsyncStorage.getItem('@cart');
        const cartItems = localCart ? JSON.parse(localCart) : [];
        
        const updatedItems = cartItems.filter(item => item.id !== medicineId);
        
        await AsyncStorage.setItem('@cart', JSON.stringify(updatedItems));
        return medicineId;
      } catch (localError) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.clearCart();
      return response;
    } catch (error) {
      // If API fails, clear local cart
      try {
        await AsyncStorage.removeItem('@cart');
        return null;
      } catch (localError) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch cart cases
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      
      // Add to cart cases
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      
      // Update quantity cases
      .addCase(updateQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      
      // Remove from cart cases
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      
      // Clear cart cases
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.isLoading = false;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export default cartSlice.reducer;
