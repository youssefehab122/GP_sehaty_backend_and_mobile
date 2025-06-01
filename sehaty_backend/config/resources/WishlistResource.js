import Wishlist from '../../models/WishlistModel.js';

const WishlistResource = {
  resource: Wishlist,
  options: {
    navigation: {
      name: 'Wishlist Management',
      icon: 'Heart',
    },
    properties: {
      userId: {
        reference: 'User',
      },
      medicineId: {
        reference: 'Medicine',
      },
    },
  },
};

export default WishlistResource; 