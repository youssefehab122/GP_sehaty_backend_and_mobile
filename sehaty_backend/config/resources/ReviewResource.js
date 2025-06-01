import Review from '../../models/ReviewModel.js';

const ReviewResource = {
  resource: Review,
  options: {
    navigation: {
      name: 'Review Management',
      icon: 'Star',
    },
    properties: {
      userId: {
        reference: 'User',
      },
      targetId: {
        type: 'string',
      },
    },
  },
};

export default ReviewResource; 