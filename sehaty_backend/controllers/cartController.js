import Cart from '../models/CartModel.js';
import Wishlist from '../models/WishlistModel.js';
import PharmacyMedicine from '../models/PharmacyMedicineModel.js';
import Medicine from '../models/MedicineModel.js';
import Pharmacy from '../models/PharmacyModel.js';

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { medicineId, quantity, pharmacyId } = req.body;
    
    // Validate required fields
    if (!medicineId || !pharmacyId) {
      return res.status(400).json({ 
        message: 'Medicine ID and Pharmacy ID are required' 
      });
    }

    console.log('Add to cart request:', {
      medicineId,
      pharmacyId,
      quantity,
      userId: req.user._id
    });

    // Check if medicine is available in the pharmacy
    const pharmacyMedicineQuery = {
      medicineId,
      pharmacyId,
      isAvailable: true,
      isDeleted: false
    };
    
    console.log('Searching for pharmacy medicine with query:', pharmacyMedicineQuery);
    
    const pharmacyMedicine = await PharmacyMedicine.findOne(pharmacyMedicineQuery)
      .populate('medicineId')
      .populate('pharmacyId');

    console.log('Found pharmacy medicine:', pharmacyMedicine ? {
      medicineId: pharmacyMedicine.medicineId?._id,
      medicineName: pharmacyMedicine.medicineId?.name,
      pharmacyId: pharmacyMedicine.pharmacyId?._id,
      pharmacyName: pharmacyMedicine.pharmacyId?.name,
      price: pharmacyMedicine.price,
      stock: pharmacyMedicine.stock,
      isAvailable: pharmacyMedicine.isAvailable
    } : null);

    if (!pharmacyMedicine) {
      console.log('Medicine not found in pharmacy. Checking if medicine exists...');
      
      // Check if medicine exists
      const medicine = await Medicine.findById(medicineId);
      console.log('Medicine exists:', medicine ? {
        id: medicine._id,
        name: medicine.name
      } : null);
      
      // Check if pharmacy exists
      const pharmacy = await Pharmacy.findById(pharmacyId);
      console.log('Pharmacy exists:', pharmacy ? {
        id: pharmacy._id,
        name: pharmacy.name
      } : null);
      
      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }
      
      if (!pharmacy) {
        return res.status(404).json({ message: 'Pharmacy not found' });
      }
      
      return res.status(400).json({ message: 'Medicine is not available in this pharmacy' });
    }

    if (pharmacyMedicine.stock < quantity) {
      console.log('Insufficient stock:', {
        requested: quantity,
        available: pharmacyMedicine.stock
      });
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      console.log('Creating new cart for user:', req.user._id);
      cart = new Cart({ userId: req.user._id, items: [] });
    } else {
      console.log('Found existing cart:', {
        cartId: cart._id,
        itemCount: cart.items.length
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      item => item.medicineId.toString() === medicineId && item.pharmacyId.toString() === pharmacyId
    );

    if (existingItem) {
      console.log('Updating existing item quantity:', {
        currentQuantity: existingItem.quantity,
        addingQuantity: quantity
      });
      existingItem.quantity += quantity;
    } else {
      console.log('Adding new item to cart:', {
        medicineId,
        pharmacyId,
        quantity,
        price: pharmacyMedicine.price
      });
      cart.items.push({
        medicineId,
        pharmacyId,
        quantity,
        price: pharmacyMedicine.price
      });
    }

    await cart.save();
    console.log('Cart saved successfully');
    
    // Populate the cart items before sending response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.medicineId',
        select: 'name description image price'
      })
      .populate({
        path: 'items.pharmacyId',
        select: 'name address phone'
      });
    
    console.log('Populated cart response:', JSON.stringify(populatedCart, null, 2));
    res.json(populatedCart);
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  try {
    const { medicineId, quantity, pharmacyId } = req.body;
    const itemId = req.params.id;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item in the cart
    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock
    const pharmacyMedicine = await PharmacyMedicine.findOne({
      medicineId: item.medicineId,
      pharmacyId: item.pharmacyId,
      isAvailable: true,
      isDeleted: false
    });

    if (!pharmacyMedicine) {
      return res.status(400).json({ message: 'Medicine is no longer available in this pharmacy' });
    }

    if (pharmacyMedicine.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update quantity and price
    item.quantity = quantity;
    item.price = pharmacyMedicine.price;
    
    await cart.save();

    // Populate the cart items before sending response
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.medicineId')
      .populate('items.pharmacyId');

    res.json(updatedCart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { medicineId, pharmacyId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    console.log(medicineId,pharmacyId);

    cart.items = cart.items.filter(
      item => !(item._id.toString() === medicineId && item.pharmacyId.toString() === pharmacyId)
    );
    console.log("remove from cart ==> ", JSON.stringify(cart.items,null,2));

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.medicineId')
      .populate('items.pharmacyId');

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { medicineId } = req.body;

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
    }

    if (!wishlist.items.includes(medicineId)) {
      wishlist.items.push(medicineId);
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(
      item => item.toString() !== medicineId
    );

    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate('items');

    if (!wishlist) {
      return res.json({ items: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 