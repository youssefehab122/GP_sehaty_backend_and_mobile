import Address from '../models/AddressModel.js';
import User from '../models/UserModel.js';

// Get all addresses for a user
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ 
      userId: req.user._id,
      isDeleted: false 
    });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new address
export const addAddress = async (req, res) => {
  try {
    console.log("[Backend] Received address data:", req.body);
    const { title, address: addressString, latitude, longitude, isDefault } = req.body;

    // Validate required fields
    if (!addressString || !latitude || !longitude) {
      console.log("[Backend] Missing required fields:", { addressString, latitude, longitude });
      return res.status(400).json({ 
        message: "Missing required fields: address, latitude, and longitude are required" 
      });
    }

    // Check if this is the first address for the user
    const existingAddresses = await Address.find({ 
      userId: req.user._id,
      isDeleted: false 
    });

    // If this is the first address or explicitly set as default, make it default
    const shouldBeDefault = isDefault || existingAddresses.length === 0;

    if (shouldBeDefault) {
      console.log("[Backend] Setting as default address");
      // Unset any existing default address
      await Address.updateMany(
        { userId: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const addressData = {
      userId: req.user._id,
      title: title || "My Address",
      address: addressString,
      latitude,
      longitude,
      isDefault: shouldBeDefault
    };

    console.log("[Backend] Creating new address with data:", addressData);

    const newAddress = new Address(addressData);
    const savedAddress = await newAddress.save();
    console.log("[Backend] Successfully saved address:", savedAddress);

    // Update user's addresses array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: savedAddress._id } }
    );

    res.status(201).json(savedAddress);
  } catch (error) {
    console.error("[Backend] Error creating address:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update an address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, street, city, state, country, zipCode, latitude, longitude, isDefault } = req.body;

    // Check if address belongs to user
    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id, isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        title,
        street,
        city,
        state,
        country,
        zipCode,
        address: `${street}, ${city}, ${state}, ${country}, ${zipCode}`,
        latitude,
        longitude,
        isDefault
      },
      { new: true }
    );

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an address (soft delete)
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Soft delete the address
    await Address.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Remove from user's addresses array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: id } }
    );

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Unset any existing default address
    await Address.updateMany(
      { userId: req.user._id, isDefault: true },
      { isDefault: false }
    );

    // Set new default address
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    );

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 