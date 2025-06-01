import Order from '../../models/OrderModel.js';

const OrderResource = {
  resource: Order,
  options: {
    navigation: {
      name: 'Order Management',
      icon: 'ShoppingCart',
    },
    properties: {
      userId: {
        reference: 'User',
      },
      items: {
        type: 'mixed',
        isArray: true,
      },
      deliveryAddress: {
        reference: 'Address',
      },
      promoCode: {
        reference: 'PromoCode',
      },
    },
  },
};

export default OrderResource; 