const db = require('./../models');
const User = db.User;
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('./../Helpers/transporter');
const handlebars = require('handlebars');
const { Op } = require('sequelize');

module.exports = {
	getUserLogin: async (req, res) => {
		try {
			const { id } = req.user;
			console.log(id);

			const result = await User.findOne({
				include: {
					model: db.Post,
					attributes: ['id', 'userId', 'caption', 'image'],
					include: {
						model: db.PostLike,
						attributes: ['id', 'userId', 'postId'],
					},
				},
				where: {
					id,
				},
			});

			let payload = {
				id: result.id,
				fullName: result.fullName,
				userName: result.userName,
				email: result.email,
				profilePicture: result.profilePicture,
				bio: result.bio,
				status: result.status,
			};

			return res.status(200).send({
				success: true,
				message: 'Fetch data success!',
				data: result,
			});
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error.message,
				data: null,
			});
		}
	},
	editUserProfile: async (req, res) => {
		try {
			const { fullName, userName, bio } = req.body;
			const { id, status } = req.user;
			const file = req.file;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			if (!fullName && !userName && !bio && !file?.filename) {
				return res.status(400).send({
					success: false,
					message: 'Please fill out the form!',
					data: null,
				});
			}

			const checkUserName = await User.findOne({
				where: {
					userName: userName,
					id: { [Op.ne]: id },
				},
			});

			if (checkUserName) {
				return res.status(400).send({
					success: false,
					message: 'Username has already taken!',
					data: checkUserName,
				});
			}

			const checkUser = await User.findOne({
				where: {
					id,
				},
			});

			if (checkUser) {
				const updateProfile = await User.update(
					{
						fullName: fullName ? fullName : checkUser.fullName,
						userName: userName ? userName : checkUser.userName,
						bio: bio ? bio : checkUser.bio,
						profilePicture: file?.filename
							? file?.filename
							: checkUser.profilePicture,
					},
					{
						where: {
							id,
						},
					}
				);

				if (fullName) {
					const updateFullName = await User.update(
						{
							fullName,
						},
						{
							where: {
								id,
							},
						}
					);
				}

				if (userName) {
					const updateUserName = await User.update(
						{ userName },
						{
							where: {
								id,
							},
						}
					);
				}

				if (bio) {
					const updateBio = await User.update(
						{ bio },
						{
							where: {
								id,
							},
						}
					);
				}

				let payload = {
					fullName: checkUser.fullName,
					userName: checkUser.userName,
					email: checkUser.email,
					profilePicture: checkUser.profilePicture,
					bio: checkUser.bio,
					status: checkUser.status,
				};

				return res.status(200).send({
					success: true,
					message: 'Update profile success!',
					data: payload,
				});
			}

			return res.status(200).send({
				success: true,
				message: 'Success',
				data: checkUserName,
			});
		} catch (error) {
			res.status(500).send({
				success: false,
				message: error.message,
				data: null,
			});
		}
	},
};
