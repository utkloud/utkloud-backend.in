import OurSection from '../models/OurSection.js';

// Get all "Our" section items
export const getAllItems = async (req, res) => {
  try {
    const items = await OurSection.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// Get all items (including inactive) - for admin
export const getAllItemsAdmin = async (req, res) => {
  try {
    const items = await OurSection.find()
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// Get single item by ID
export const getItemById = async (req, res) => {
  try {
    const item = await OurSection.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message
    });
  }
};

// Create new item
export const createItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      image, 
      icon, 
      order, 
      isActive, 
      category,
      price,
      badge,
      tag,
      popular,
      features,
      subtitle
    } = req.body;
    
    const newItem = new OurSection({
      title,
      description,
      image,
      icon,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      category: category || 'general',
      price,
      badge,
      tag,
      popular: popular || false,
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []),
      subtitle
    });
    
    const savedItem = await newItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: savedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      image, 
      icon, 
      order, 
      isActive, 
      category,
      price,
      badge,
      tag,
      popular,
      features,
      subtitle
    } = req.body;
    
    const item = await OurSection.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (image !== undefined) item.image = image;
    if (icon !== undefined) item.icon = icon;
    if (order !== undefined) item.order = order;
    if (isActive !== undefined) item.isActive = isActive;
    if (category !== undefined) item.category = category;
    if (price !== undefined) item.price = price;
    if (badge !== undefined) item.badge = badge;
    if (tag !== undefined) item.tag = tag;
    if (popular !== undefined) item.popular = popular;
    if (features !== undefined) {
      item.features = Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []);
    }
    if (subtitle !== undefined) item.subtitle = subtitle;
    
    const updatedItem = await item.save();
    
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const item = await OurSection.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};

