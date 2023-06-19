const express = require('express');
const router = express.Router();

const { userController } = require('./../Controllers');
const { verifyToken } = require('../Middleware/auth');
const { profileUpload } = require('./../Middleware/multer');

// Router
router.post('/profile', verifyToken, userController.getUserLogin);
router.patch(
	'/edit/profile',
	verifyToken,
	profileUpload.single('profilePicture'),
	userController.editUserProfile
);

module.exports = router;
