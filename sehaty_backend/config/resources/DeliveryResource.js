import Delivery from '../../models/DeliveryModel.js';

const DeliveryResource = {
  resource: Delivery,
  options: {
    navigation: {
      name: 'Delivery Management',
      icon: 'Truck',
    },
    properties: {
      orderId: {
        reference: 'Order',
      },
      deliveryPersonId: {
        reference: 'User',
      },
    },
  },
};

export default DeliveryResource; 