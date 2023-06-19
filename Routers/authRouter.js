const express = require('express');
const router = express.Router();

const { authController, userController } = require('./../Controllers');
const { verifyToken } = require('../Middleware/auth');

// Router
router.post('/register', authController.register);
router.post('/login', authController.login);
router.patch('/verification', verifyToken, authController.verify);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword', verifyToken, authController.resetPassword);
router.patch(
	'/resendingverification',
	verifyToken,
	authController.resendingVerification
);
router.get('/token', authController.getAllToken);
router.get('/tokenpassword', authController.getAllPasswordToken);

module.exports = router;
