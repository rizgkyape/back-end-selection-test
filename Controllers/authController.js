const db = require('./../models');
const User = db.User;
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('./../Helpers/transporter');
const handlebars = require('handlebars');

module.exports = {
	register: async (req, res) => {
		try {
			const { email, userName, password, passwordConfirmation } = req.body;

			if (!email || !userName || !password || !passwordConfirmation) {
				return res.status(400).send({
					success: false,
					message: 'Please fill out the form!',
					data: null,
				});
			}

			const checkPassword =
				/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

			if (!password.match(checkPassword))
				throw {
					message:
						'Passwords must contain at least 8 characters one uppercase letter, one symbol, and one number!',
				};

			if (password != passwordConfirmation)
				throw { message: "Password doesn't match!" };

			const checkEmail = await User.findOne({
				where: {
					email,
				},
			});

			if (checkEmail) {
				return res.status(400).send({
					success: false,
					message: 'Email already taken!',
					data: null,
				});
			}

			const checkUserName = await User.findOne({
				where: {
					userName,
				},
			});

			if (checkUserName) {
				return res.status(400).send({
					success: false,
					message: 'Username already taken!',
					data: null,
				});
			}

			const salt = await bcrypt.genSalt(10);
			const hashPassword = await bcrypt.hash(password, salt);

			const result = await User.create({
				email,
				userName,
				password: hashPassword,
			});

			const data = fs.readFileSync(
				'./Email_Template/accountActivation.html',
				'utf-8'
			);

			let payload = {
				id: result.id,
				userName: result.userName,
				status: result.status,
			};

			const token = jwt.sign(payload, 'coding-its-easy');

			const inputToken = await User.update(
				{
					token: token,
				},
				{
					where: {
						id: result.id,
					},
				}
			);

			const tempCompile = await handlebars.compile(data);
			const tempResult = tempCompile({
				userName: userName,
				link: `http://localhost:3000/activation/${token}`,
			});

			if (result) {
				await transporter.sendMail({
					sender: 'Administrator User Support Team',
					to: 'cheesybites81197@gmail.com',
					subject: 'Activation',
					html: tempResult,
				});
				return res.status(201).send({
					success: true,
					message: 'Register Success, please check your email for activation!',
					data: {
						userName: result.userName,
						email: result.email,
					},
				});
			} else {
				return res.status(406).send({
					success: false,
					message: 'register failed!',
					data: null,
				});
			}
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error.message,
				data: null,
			});
		}
	},
	login: async (req, res) => {
		try {
			const { emailOrUsername, password } = req.body;

			if (!emailOrUsername || !password) {
				return res.status(400).send({
					success: false,
					message: 'Please fill out the form!',
					data: null,
				});
			}

			if (emailOrUsername.includes('@')) {
				result = await User.findOne({
					where: {
						email: emailOrUsername,
					},
				});
			} else {
				result = await User.findOne({
					where: {
						userName: emailOrUsername,
					},
				});
			}

			if (!result) {
				return res.status(404).send({
					success: false,
					message: 'Wrong email, username or password!',
					data: null,
				});
			}

			const isUserExist = await bcrypt.compare(
				req.body.password,
				result.password
			);

			if (isUserExist) {
				let payload = {
					id: result.id,
					email: result.email,
					userName: result.userName,
					status: result.status,
				};

				const token = jwt.sign(payload, 'coding-its-easy');

				return res.status(200).send({
					success: true,
					message: 'Login Success!',
					data: {
						id: result.id,
						email: result.email,
						userName: result.userName,
						status: result.status,
						token,
					},
				});
			} else {
				return res.status(404).send({
					success: false,
					message: 'Wrong email, username or password!',
					data: null,
				});
			}
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error.message,
				data: null,
			});
		}
	},
	verify: async (req, res) => {
		try {
			const userId = req.user.id;

			const result = await User.findOne({
				where: {
					id: userId,
				},
			});

			if (result) {
				const verify = await User.update(
					{
						status: true,
						token: 'Expired',
					},
					{
						where: {
							id: userId,
						},
					}
				);

				const resultUpdate = await User.findOne({
					where: {
						id: userId,
					},
				});

				return res.status(200).send({
					success: true,
					message: 'Verify success!',
					data: resultUpdate,
				});
			} else {
				return res.status(400).send({
					success: false,
					message: 'Verify failed!',
					data: null,
				});
			}
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error,
				data: null,
			});
		}
	},
	forgotPassword: async (req, res) => {
		try {
			const { email } = req.body;

			if (!email) {
				return res.status(400).send({
					success: false,
					message: 'Please fill out the form!',
					data: null,
				});
			}

			const result = await User.findOne({
				where: {
					email: email,
				},
			});

			let payload = {
				id: result.id,
				userName: result.userName,
				status: result.status,
			};

			const token = jwt.sign(payload, 'coding-its-easy');

			const updatePassword = await User.update(
				{
					passwordToken: token,
				},
				{
					where: {
						id: result.id,
					},
				}
			);

			const updateData = await User.findOne({
				where: {
					id: result.id,
				},
			});

			const data = fs.readFileSync(
				'./Email_Template/forgotPassword.html',
				'utf-8'
			);

			const tempCompile = await handlebars.compile(data);
			const tempResult = tempCompile({
				userName: updateData.userName,
				link: `http://localhost:3000/resetpassword/${token}`,
			});

			await transporter.sendMail({
				sender: 'Administrator User Support Team',
				to: 'cheesybites81197@gmail.com',
				subject: 'Reset Password',
				html: tempResult,
			});
			return res.status(201).send({
				success: true,
				message: 'Please check your email for reset your password!',
				data: {
					userName: updateData.userName,
					email: updateData.email,
				},
			});
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error.message,
				data: null,
			});
		}
	},
	resetPassword: async (req, res) => {
		try {
			const { password, passwordConfirmation } = req.body;
			const { id } = req.user;

			if (!password && !passwordConfirmation) {
				return res.status(400).send({
					success: false,
					message: 'Please input new password!',
					data: null,
				});
			}

			const checkPassword =
				/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

			if (!password.match(checkPassword))
				return res.status(400).send({
					success: false,
					message:
						'Passwords must contain at least 8 characters one uppercase letter, one symbol, and one number!',
					data: null,
				});

			if (password != passwordConfirmation) {
				return res.status(400).send({
					success: false,
					message: "Password doesn't match!",
					data: null,
				});
			}

			const result = await User.findOne({
				where: {
					id,
				},
			});

			if (result) {
				const salt = await bcrypt.genSalt(10);
				const hashPassword = await bcrypt.hash(password, salt);

				const updatePassword = await User.update(
					{ password: hashPassword, passwordToken: 'Expired' },
					{
						where: {
							id,
						},
					}
				);

				const resultUpdate = await User.findOne({
					where: {
						id,
					},
				});

				return res.status(200).send({
					success: true,
					message: 'Reset password success!',
					data: {
						userName: resultUpdate.userName,
						email: resultUpdate.email,
						password: resultUpdate.password,
					},
				});
			} else {
				return res.status(400).send({
					success: false,
					message: 'Reset password failed',
					data: null,
				});
			}
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error,
				data: null,
			});
		}
	},
	resendingVerification: async (req, res) => {
		try {
			const { id, userName } = req.user;

			const result = await User.findOne({
				where: {
					id,
				},
			});

			if (result) {
				let payload = {
					id: result.id,
					email: result.email,
					userName: result.userName,
					status: result.status,
				};

				const token = jwt.sign(payload, 'coding-its-easy');

				const updateToken = await User.update(
					{
						token,
					},
					{
						where: {
							id: id,
						},
					}
				);

				const data = fs.readFileSync(
					'./Email_Template/accountActivation.html',
					'utf-8'
				);

				const tempCompile = await handlebars.compile(data);
				const tempResult = tempCompile({
					userName: userName,
					link: `http://localhost:3000/activation/${token}`,
				});

				await transporter.sendMail({
					sender: 'Administrator User Support Team',
					to: 'cheesybites81197@gmail.com',
					subject: 'Reset Password',
					html: tempResult,
				});

				const resultUpdate = await User.findOne({
					where: {
						id,
					},
				});

				return res.status(200).send({
					success: true,
					message:
						'Resending verification link success ! please check your email',
					data: resultUpdate,
				});
			} else {
				return res.status(400).send({
					success: false,
					message: 'Failed!',
					data: null,
				});
			}
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error.message,
				data: null,
			});
		}
	},
	getAllToken: async (req, res) => {
		try {
			const result = await User.findAll({ attributes: ['token'] });
			res.status(200).send({
				success: true,
				message: 'Fetch success!',
				data: result,
			});
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error,
				data: null,
			});
		}
	},
	getAllPasswordToken: async (req, res) => {
		try {
			const result = await User.findAll({ attributes: ['passwordToken'] });
			res.status(200).send({
				success: true,
				message: 'Fetch success!',
				data: result,
			});
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error,
				data: null,
			});
		}
	},
};
