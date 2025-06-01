import Notification from '../../models/NotificationModel.js';

const NotificationResource = {
  resource: Notification,
  options: {
    navigation: {
      name: 'Notification Management',
      icon: 'Bell',
    },
    properties: {
      userId: {
        reference: 'User',
      },
    },
  },
};

export default NotificationResource; 