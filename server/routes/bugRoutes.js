const express = require('express');
const router = express.Router();
const { 
  createBug, 
  getAllBugs, 
  getBugById, 
  updateBug, 
  deleteBug,
  addComment,
  getComments,
  deleteComment
} = require('../controllers/bugController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateBugInput = require('../validations/bugValidation');
const validateCommentInput = require('../validations/commentValidation');
const asyncHandler = require('../middlewares/asyncHandler');

// Apply authentication to all bug routes
router.use(protect);

router
  .route('/')
  .get(asyncHandler(getAllBugs))
  .post(validateBugInput, asyncHandler(createBug));

router
  .route('/:id')
  .get(asyncHandler(getBugById))
  .put(validateBugInput, asyncHandler(updateBug))
  .delete(authorizeRoles('Admin'), asyncHandler(deleteBug));

// Comment routes
router
  .route('/:id/comments')
  .get(asyncHandler(getComments))
  .post(validateCommentInput, asyncHandler(addComment));

router
  .route('/:id/comments/:commentId')
  .delete(asyncHandler(deleteComment));

module.exports = router;