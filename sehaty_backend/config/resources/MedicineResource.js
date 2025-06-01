import Medicine from '../../models/MedicineModel.js';

const MedicineResource = {
  resource: Medicine,
  options: {
    navigation: {
      name: 'Medicine Management',
      icon: 'Package',
    },
    properties: {
      categoryId: {
        reference: 'Category',
        type: 'reference',
      },
      alternatives: {
        reference: 'Medicine',
        isArray: true,
        type: 'reference',
      },
      price: {
        type: 'number',
        isVisible: {
          list: true,
          edit: true,
          filter: true,
          show: true,
        },
      },
      discount: {
        type: 'number',
        isVisible: {
          list: true,
          edit: true,
          filter: true,
          show: true,
        },
      },
    },
  },
};

export default MedicineResource; 