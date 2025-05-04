const express = require('express');
const router = express.Router();
const { 
  createBug, 
  getAllBugs, 
  getBugById, 
  updateBug, 
  deleteBug 
} = require('../controllers/bugController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateBugInput = require('../validations/bugValidation');
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

module.exports = router;
