import Category from '../../models/CategoryModel.js';

const CategoryResource = {
  resource: Category,
  options: {
    navigation: {
      name: 'Category Management',
      icon: 'Tag',
    },
    properties: {
      // Add any custom properties or configurations here
    },
  },
};

export default CategoryResource; 