import Prescription from '../../models/PrescriptionModel.js';

const PrescriptionResource = {
  resource: Prescription,
  options: {
    navigation: {
      name: 'Prescription Management',
      icon: 'FileText',
    },
    properties: {
      patientId: {
        reference: 'User',
      },
      medicines: {
        type: 'mixed',
        isArray: true,
      },
    },
  },
};

export default PrescriptionResource; 