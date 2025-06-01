// store/slices/addressSlice.js
import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addressesAPI } from "../../services/api";

// Helper function for local storage
const updateLocalAddresses = async (updatedAddresses) => {
  try {
    await AsyncStorage.setItem("@address", JSON.stringify(updatedAddresses));
  } catch (error) {
    console.error("Local storage update failed:", error);
  }
};

export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressesAPI.getAddresses();
      const addresses = Array.isArray(response) ? response : [response];
      await updateLocalAddresses(addresses);
      return addresses;
    } catch (error) {
      try {
        const localAddresses = await AsyncStorage.getItem("@address");
        return localAddresses ? JSON.parse(localAddresses) : [];
      } catch (localError) {
        return rejectWithValue("Failed to load addresses");
      }
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (addressData, { rejectWithValue, getState }) => {
    try {
      const newAddress = await addressesAPI.addAddress(addressData);
      const currentAddresses = getState().address.items;
      const updatedAddresses = [...currentAddresses, newAddress];

      await updateLocalAddresses(updatedAddresses);
      return newAddress;
    } catch (error) {
      return rejectWithValue("Failed to add address");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, ...updates }, { rejectWithValue, getState }) => {
    try {
      const updatedAddress = await addressesAPI.updateAddress(id, updates);
      const currentAddresses = getState().address.items;
      const updatedAddresses = currentAddresses.map((addr) =>
        (addr._id === id || addr.id === id) ? { ...addr, ...updatedAddress } : addr
      );

      await updateLocalAddresses(updatedAddresses);
      return updatedAddress;
    } catch (error) {
      console.error("Error updating address:", error);
      return rejectWithValue("Failed to update address");
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefaultAddress",
  async (id, { rejectWithValue, getState }) => {
    try {
      if (!id) {
        throw new Error("Address ID is required");
      }

      await addressesAPI.setDefaultAddress(id);
      const currentAddresses = getState().address.items;
      const updatedAddresses = currentAddresses.map((addr) => ({
        ...addr,
        isDefault: addr._id === id || addr.id === id,
      }));

      await updateLocalAddresses(updatedAddresses);
      // Save selected default address separately
      const selectedAddress = updatedAddresses.find(
        (addr) => addr._id === id || addr.id === id
      );
      if (selectedAddress) {
        await AsyncStorage.setItem(
          "@selected_address",
          JSON.stringify(selectedAddress)
        );
      }

      return updatedAddresses;
    } catch (error) {
      console.error("Error setting default address:", error);
      return rejectWithValue(error.message || "Failed to set default address");
    }
  }
);

export const removeAddress = createAsyncThunk(
  "address/removeAddress",
  async (id, { rejectWithValue, getState }) => {
    try {
      await addressesAPI.removeAddress(id);
      const currentAddresses = getState().address.items;
      const updatedAddresses = currentAddresses.filter(
        (addr) => addr._id !== id && addr.id !== id
      );

      // Set new default if needed
      if (
        updatedAddresses.length > 0 &&
        !updatedAddresses.some((a) => a.isDefault)
      ) {
        updatedAddresses[0].isDefault = true;
      }

      await updateLocalAddresses(updatedAddresses);
      return updatedAddresses;
    } catch (error) {
      console.error("Error removing address:", error);
      return rejectWithValue("Failed to remove address");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    items: [],
    selected: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAddresses: (state) => {
      state.items = [];
    },
    setSelectedAddress: (state, action) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(addAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
        state.isLoading = false;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(removeAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(removeAddress.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (addr) => addr._id === action.payload._id || addr.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        state.isLoading = false;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(setDefaultAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.items = action.payload;
        state.selected = action.payload.find((addr) => addr.isDefault);
        state.isLoading = false;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const { clearAddresses, setSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;
