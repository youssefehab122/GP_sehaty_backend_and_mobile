import Wishlist from '../models/WishlistModel.js';
import Medicine from '../models/MedicineModel.js';
import PharmacyMedicine from '../models/PharmacyMedicineModel.js';

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ 
      userId: req.user._id,
      isDeleted: false 
    }).populate({
      path: 'medicineId',
      select: '_id name description price originalPrice image quantity inStock pharmacyInfo'
    });

    // Get pharmacy stock information for each medicine
    const items = await Promise.all(wishlist.map(async (item) => {
      // Get the first available pharmacy medicine entry
      const pharmacyMedicine = await PharmacyMedicine.findOne({
        medicineId: item.medicineId._id,
        isAvailable: true,
        isDeleted: false,
        stock: { $gt: 0 }
      }).populate('pharmacyId', 'name image');

      // Calculate if the medicine is in stock
      const inStock = item.medicineId.isAvailable && 
                     item.medicineId.availableStock > 0 && 
                     pharmacyMedicine !== null;

      // Get pharmacy info if available
      const pharmacyInfo = pharmacyMedicine ? {
        pharmacyId: pharmacyMedicine.pharmacyId._id.toString(),
        pharmacyName: pharmacyMedicine.pharmacyId.name,
        pharmacyImage: pharmacyMedicine.pharmacyId.image,
        price: pharmacyMedicine.price,
        stock: pharmacyMedicine.stock
      } : null;

      return {
        medicineId: item.medicineId._id,
        _id: item.medicineId._id,
        name: item.medicineId.name,
        description: item.medicineId.description,
        price: pharmacyInfo ? pharmacyInfo.price : item.medicineId.price,
        originalPrice: item.medicineId.originalPrice,
        image: item.medicineId.image,
        quantity: item.medicineId.availableStock,
        inStock,
        pharmacyInfo
      };
    }));

    res.json({ items });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { medicineId } = req.body;

    if (!medicineId) {
      return res.status(400).json({ message: 'Medicine ID is required' });
    }

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Check if item is already in wishlist
    const existingItem = await Wishlist.findOne({
      userId: req.user._id,
      medicineId,
      isDeleted: false
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Get pharmacy stock information
    const pharmacyMedicine = await PharmacyMedicine.findOne({
      medicineId,
      isAvailable: true,
      isDeleted: false,
      stock: { $gt: 0 }
    }).populate('pharmacyId', 'name image');

    // Calculate if the medicine is in stock
    const inStock = medicine.isAvailable && 
                   medicine.availableStock > 0 && 
                   pharmacyMedicine !== null;

    // Get pharmacy info if available
    const pharmacyInfo = pharmacyMedicine ? {
      pharmacyId: pharmacyMedicine.pharmacyId._id.toString(),
      pharmacyName: pharmacyMedicine.pharmacyId.name,
      pharmacyImage: pharmacyMedicine.pharmacyId.image,
      price: pharmacyMedicine.price,
      stock: pharmacyMedicine.stock
    } : null;

    // Create new wishlist item
    const wishlistItem = new Wishlist({
      userId: req.user._id,
      medicineId
    });

    await wishlistItem.save();

    // Return the complete medicine details
    res.status(201).json({
      medicineId: medicine._id,
      _id: medicine._id,
      name: medicine.name,
      description: medicine.description,
      price: pharmacyInfo ? pharmacyInfo.price : medicine.price,
      originalPrice: medicine.originalPrice,
      image: medicine.image,
      quantity: medicine.availableStock,
      inStock,
      pharmacyInfo
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { medicineId } = req.params;

    if (!medicineId) {
      return res.status(400).json({ message: 'Medicine ID is required' });
    }

    // Find and soft delete the wishlist item
    const wishlistItem = await Wishlist.findOne({
      userId: req.user._id,
      medicineId,
      isDeleted: false
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    wishlistItem.isDeleted = true;
    wishlistItem.deletedAt = new Date();
    await wishlistItem.save();

    res.json({ message: 'Item removed from wishlist', medicineId });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
}; 