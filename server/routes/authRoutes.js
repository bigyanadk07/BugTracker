const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateUser, validateLogin } = require('../validations/userValidation');

// Public routes
router.post('/register', validateUser, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validateUser, updateUserProfile);

// Admin route to register users with specific roles
router.post(
  '/admin/register',
  protect, 
  authorizeRoles('Admin'),
  validateUser,
  registerUser
);

module.exports = router;