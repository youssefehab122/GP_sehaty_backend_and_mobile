import Cart from '../../models/CartModel.js';

const CartResource = {
  resource: Cart,
  options: {
    navigation: {
      name: 'Cart Management',
      icon: 'ShoppingBag',
    },
    properties: {
      userId: {
        reference: 'User',
      },
      items: {
        type: 'mixed',
        isArray: true,
      },
    },
  },
};

export default CartResource; 