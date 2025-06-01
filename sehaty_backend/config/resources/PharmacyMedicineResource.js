import PharmacyMedicine from '../../models/PharmacyMedicineModel.js';

const PharmacyMedicineResource = {
  resource: PharmacyMedicine,
  options: {
    navigation: {
      name: 'Pharmacy Medicines',
      icon: 'Package',
    },
    properties: {
      pharmacyId: {
        reference: 'Pharmacy',
      },
      medicineId: {
        reference: 'Medicine',
      },
      price: {
        type: 'number',
      },
      discount: {
        type: 'number',
      },
    },
  },
};

export default PharmacyMedicineResource; 