const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateUser } = require('../validations/userValidation');  // Fixed import

// All user routes are protected and limited to Admin
router.use(protect);
router.use(authorizeRoles('Admin'));

// Get all users
router.route('/').get(getUsers);

// Get, update and delete user by ID
router
  .route('/:id')
  .get(getUserById)
  .put(validateUser, updateUser)  // Fixed middleware name
  .delete(deleteUser);

module.exports = router;