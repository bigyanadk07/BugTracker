const Bug = require('../models/Bug');
const logger = require('../utils/logger');

/**
 * Create a new bug
 * @route POST /api/bugs
 * @access Private
 */
const createBug = async (req, res) => {
  try {
    // Set the created by field to the current user
    req.body.createdBy = req.user._id;
    
    // Create bug
    const bug = await Bug.create(req.body);
    
    logger.info(`Bug created: ${bug._id} by user ${req.user._id}`);
    
    res.status(201).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    logger.error(`Error creating bug: ${error.message}`);
    res.status(400);
    throw new Error(error.message);
  }
};

/**
 * Get all bugs with pagination and filtering
 * @route GET /api/bugs
 * @access Private
 */
const getAllBugs = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(field => delete queryObj[field]);
    
    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Find bugs
    let query = Bug.find(JSON.parse(queryStr))
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const bugs = await query;
    
    // Get total count
    const total = await Bug.countDocuments(JSON.parse(queryStr));
    
    res.status(200).json({
      success: true,
      count: bugs.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: bugs,
    });
  } catch (error) {
    logger.error(`Error fetching bugs: ${error.message}`);
    res.status(500);
    throw new Error('Server error while fetching bugs');
  }
};

/**
 * Get a single bug by ID
 * @route GET /api/bugs/:id
 * @access Private
 */
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('comments.createdBy', 'name');
    
    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }
    
    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Bug not found with this ID');
    }
    
    logger.error(`Error fetching bug: ${error.message}`);
    throw error;
  }
};

/**
 * Update a bug
 * @route PUT /api/bugs/:id
 * @access Private
 */
const updateBug = async (req, res) => {
  try {
    let bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }
    
    // Check if user is creator of bug or admin
    if (
      bug.createdBy.toString() !== req.user._id.toString() && 
      req.user.role !== 'Admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to update this bug');
    }
    
    // Update bug
    bug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name').populate('assignedTo', 'name');
    
    logger.info(`Bug updated: ${bug._id} by user ${req.user._id}`);
    
    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Bug not found with this ID');
    }
    
    logger.error(`Error updating bug: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a bug
 * @route DELETE /api/bugs/:id
 * @access Private (Admin only)
 */
const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }
    
    await bug.deleteOne();
    
    logger.info(`Bug deleted: ${req.params.id} by admin ${req.user._id}`);
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Bug removed successfully',
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Bug not found with this ID');
    }
    
    logger.error(`Error deleting bug: ${error.message}`);
    throw error;
  }
};

/**
 * Add a comment to a bug
 * @route POST /api/bugs/:id/comments
 * @access Private
 */
const addComment = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }
    
    // Create new comment
    const newComment = {
      text: req.body.text,
      createdBy: req.user._id
    };
    
    // Add comment to bug
    bug.comments.push(newComment);
    
    // Save bug with new comment
    await bug.save();
    
    // Get the newly added comment
    const comment = bug.comments[bug.comments.length - 1];
    
    logger.info(`Comment added to bug ${bug._id} by user ${req.user._id}`);
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Bug not found with this ID');
    }
    
    logger.error(`Error adding comment: ${error.message}`);
    throw error;
  }
};

/**
 * Get all comments for a bug
 * @route GET /api/bugs/:id/comments
 * @access Private
 */
const getComments = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .select('comments')
      .populate('comments.createdBy', 'name');
    
    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }
    
    res.status(200).json({
      success: true,
      count: bug.comments.length,
      data: bug.comments
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Bug not found with this ID');
    }
    
    logger.error(`Error fetching comments: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a comment
 * @route DELETE /api/bugs/:id/comments/:commentId
 * @access Private
 */
const deleteComment = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }
    
    // Find comment by ID
    const comment = bug.comments.id(req.params.commentId);
    
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }
    
    // Check if user is allowed to delete this comment
    if (
      comment.createdBy.toString() !== req.user._id.toString() && 
      bug.createdBy.toString() !== req.user._id.toString() && 
      req.user.role !== 'Admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to delete this comment');
    }
    
    // Remove comment
    comment.deleteOne();
    
    // Save bug with comment removed
    await bug.save();
    
    logger.info(`Comment ${req.params.commentId} deleted from bug ${bug._id} by user ${req.user._id}`);
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Comment removed successfully'
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Resource not found with this ID');
    }
    
    logger.error(`Error deleting comment: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createBug,
  getAllBugs,
  getBugById,
  updateBug,
  deleteBug,
  addComment,
  getComments,
  deleteComment
};