import Stock from '../../models/StockModel.js';

const StockResource = {
  resource: Stock,
  options: {
    navigation: {
      name: 'Stock Management',
      icon: 'Package',
    },
    properties: {
      pharmacyId: {
        reference: 'Pharmacy',
      },
      medicineId: {
        reference: 'Medicine',
      },
    },
  },
};

export default StockResource; 