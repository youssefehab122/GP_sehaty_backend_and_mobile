import PromoCode from '../../models/PromoCodeModel.js';

const PromoCodeResource = {
  resource: PromoCode,
  options: {
    navigation: {
      name: 'Promo Codes',
      icon: 'Tag',
    },
    properties: {
      // Add any custom properties or configurations here
    },
  },
};

export default PromoCodeResource; 