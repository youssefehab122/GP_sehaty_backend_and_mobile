import Reminder from '../../models/Reminder.js';

const ReminderResource = {
  resource: Reminder,
  options: {
    navigation: {
      name: 'Reminder Management',
      icon: 'Clock',
    },
    properties: {
      user: {
        reference: 'User',
      },
      medicineId: {
        reference: 'Medicine',
      },
      dailyStatuses: {
        type: 'mixed',
        isArray: true,
      },
    },
  },
};

export default ReminderResource; 