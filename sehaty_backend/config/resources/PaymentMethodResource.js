import PaymentMethod from '../../models/PaymentMethod.js';

const PaymentMethodResource = {
  resource: PaymentMethod,
  options: {
    navigation: {
      name: 'Payment Methods',
      icon: 'CreditCard',
    },
    properties: {
      // Add any custom properties or configurations here
    },
  },
};

export default PaymentMethodResource; 