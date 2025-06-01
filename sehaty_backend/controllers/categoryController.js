import Category from '../models/CategoryModel.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false })
      .sort({ name: 1 });
    
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category || category.isDeleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 