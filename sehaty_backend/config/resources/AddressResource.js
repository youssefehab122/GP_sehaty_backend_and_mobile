import Address from '../../models/AddressModel.js';

const AddressResource = {
  resource: Address,
  options: {
    navigation: {
      name: 'Address Management',
      icon: 'MapPin',
    },
    properties: {
      userId: {
        reference: 'User',
      },
    },
  },
};

export default AddressResource; 