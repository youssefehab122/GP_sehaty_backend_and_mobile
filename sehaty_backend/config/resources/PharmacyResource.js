import Pharmacy from '../../models/PharmacyModel.js';

const PharmacyResource = {
  resource: Pharmacy,
  options: {
    navigation: {
      name: 'Pharmacy Management',
      icon: 'Building',
    },
    properties: {
      ownerId: {
        reference: 'User',
      },
      paymentMethods: {
        reference: 'PaymentMethod',
        isArray: true,
      },
      workingHours: {
        type: 'mixed',
        isVisible: {
          list: false,
          edit: true,
          filter: false,
          show: true,
        },
      },
    },
  },
};

export default PharmacyResource; 