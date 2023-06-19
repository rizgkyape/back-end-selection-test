const db = require('./../models');
const Post = db.Post;
const Comment = db.Comment;
const PostLike = db.PostLike;
const { Op } = require('sequelize');
const sequelize = require('sequelize');

module.exports = {
	createPost: async (req, res) => {
		try {
			const { caption } = req.body;
			const file = req.file;
			const { id, status } = req.user;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			if (!caption && !file?.filename) {
				return res.status(400).send({
					success: false,
					message: 'Please fill out the form!',
					data: null,
				});
			}

			const result = await Post.create({
				userId: id,
				caption: caption ? caption : '',
				image: file?.filename ? file?.filename : '',
			});

			if (result) {
				return res.status(201).send({
					success: true,
					message: 'Create tweet success!',
					data: result,
				});
			} else {
				return res.status(400).send({
					success: false,
					message: 'Create tweet failed',
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
	getAllPost: async (req, res) => {
		try {
			const { limit } = req.query;

			const result = await Post.findAll({
				attributes: [
					'id',
					'userId',
					'caption',
					'image',
					[
						sequelize.fn(
							'date_format',
							sequelize.col('Post.createdAt'),
							'%d-%m-%Y'
						),
						'created',
					],
				],
				include: {
					model: db.User,
					attributes: ['id', 'userName', 'profilePicture', 'status'],
				},
				order: [['createdAt', 'DESC']],
				limit: limit ? Number(limit) + 5 : 5
			});

			// console.log(result);
			return res.status(200).send({
				success: true,
				message: 'Fetch success!',
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
	editPost: async (req, res) => {
		try {
			const { caption } = req.body;
			const { postId } = req.params;
			const file = req.file;
			const { id, status } = req.user;
			console.log(status);

			if (!status) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			if (!caption && !file?.filename) {
				return res.status(400).send({
					success: false,
					message: 'Please fill out the form!',
					data: null,
				});
			}

			const checkPost = await Post.findOne({
				where: {
					id: postId,
					userId: id,
				},
			});

			if (checkPost) {
				const result = await Post.update(
					{
						caption: caption ? caption : checkPost.caption,
						image: file?.filename ? file?.filename : checkPost.image,
					},
					{
						where: {
							id: postId,
							userId: id,
						},
					}
				);

				const resultUpdate = await Post.findOne({
					where: {
						id: id,
					},
				});

				return res.status(200).send({
					success: true,
					message: 'Edit success!',
					data: resultUpdate,
				});
			} else {
				return res.status(400).send({
					success: false,
					message: 'Post not found!',
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
	deletePost: async (req, res) => {
		try {
			const { postId } = req.params;
			const { id, status } = req.user;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			const checkPost = await Post.findOne({
				where: {
					id: postId,
					userId: id,
				},
			});

			if (checkPost) {
				const result = await Post.destroy({
					where: {
						id: postId,
						userId: id,
					},
				});

				return res.status(200).send({
					success: true,
					message: 'Post deleted!',
					data: null,
				});
			} else {
				return res.status(400).send({
					success: false,
					message: 'Post not found!',
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
	getUserPost: async (req, res) => {
		try {
			const { id } = req.user;

			const result = await Post.findAll({
				attributes: [
					'id',
					'userId',
					'caption',
					'image',
					[
						sequelize.fn(
							'date_format',
							sequelize.col('Post.createdAt'),
							'%d-%m-%Y'
						),
						'created',
					],
				],
				include: {
					model: db.User,
					attributes: ['id', 'userName', 'profilePicture', 'status'],
				},
				order: [['createdAt', 'DESC']],
				where: {
					userId: id,
				},
			});

			if (result) {
				return res.status(200).send({
					success: true,
					message: 'Fetch success!',
					data: result,
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
	postDetail: async (req, res) => {
		try {
			const { postId } = req.params;

			const result = await Post.findOne({
				attributes: [
					'id',
					'userId',
					'caption',
					'image',
					[
						sequelize.fn(
							'date_format',
							sequelize.col('Post.createdAt'),
							'%d-%m-%Y'
						),
						'created',
					],
				],
				include: {
					model: db.User,
					attributes: ['id', 'userName', 'profilePicture', 'status'],
				},
				where: {
					id: postId,
				},
			});

			if (result) {
				return res.status(200).send({
					success: true,
					message: 'Fetch success!',
					data: result,
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
	createComment: async (req, res) => {
		try {
			const { postId, comment } = req.body;
			const { id, status } = req.user;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			const result = await Comment.create({
				userId: id,
				postId: postId,
				comment,
			});

			if (result) {
				return res.status(201).send({
					success: true,
					message: 'Create comment success!',
					data: result,
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
	getComment: async (req, res) => {
		try {
			const { postId } = req.query;

			const result = await Comment.findAll({
				attributes: [
					'id',
					'userId',
					'postId',
					'comment',
					[
						sequelize.fn(
							'date_format',
							sequelize.col('Comment.createdAt'),
							'%d-%m-%Y'
						),
						'created',
					],
				],
				include: {
					model: db.User,
					attributes: ['id', 'userName', 'profilePicture', 'status'],
				},
				order: [['createdAt', 'DESC']],
				where: {
					postId,
				},
			});

			if (result) {
				return res.status(201).send({
					success: true,
					message: 'Fetch success!',
					data: result,
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
	editComment: async (req, res) => {
		try {
			const { comment } = req.body;
			const { postId, commentId } = req.query;
			const { id, status } = req.user;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			if (!comment) {
				return res.status(400).send({
					success: false,
					message: 'Please fill out the form!',
					data: null,
				});
			}

			const result = await Comment.findOne({
				where: { id: commentId, postId, userId: id },
			});

			if (result) {
				const result = await Comment.update(
					{
						comment: comment,
					},
					{
						where: {
							id: commentId,
							postId,
							userId: id,
						},
					}
				);

				const updateResult = await Comment.findOne({
					where: {
						id: commentId,
						postId,
						userId: id,
					},
				});

				return res.status(201).send({
					success: true,
					message: 'Edit comment success!',
					data: updateResult,
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
	deleteComment: async (req, res) => {
		try {
			const { postId, commentId } = req.query;
			const { id, status } = req.user;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			const result = await Comment.findOne({
				where: { id: commentId, postId, userId: id },
			});

			if (result) {
				const result = await Comment.destroy({
					where: {
						id: commentId,
						postId,
						userId: id,
					},
				});

				return res.status(200).send({
					success: true,
					message: 'Edit comment success!',
					data: {},
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
	likePost: async (req, res) => {
		try {
			const { postId } = req.query;
			const { id, status } = req.user;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			const result = await PostLike.create({
				userId: id,
				postId,
			});

			if (result) {
				return res.status(201).send({
					success: true,
					message: 'Like comment success!',
					data: result,
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
	unlikePost: async (req, res) => {
		try {
			const { postId } = req.query;
			const { id, status } = req.user;

			if (status === false) {
				return res.status(401).send({
					success: false,
					message: 'You must activate your accout!',
					data: null,
				});
			}

			const findPostLike = await PostLike.findOne({
				where: {
					postId,
					userId: id,
				},
			});

			if (findPostLike) {
				const result = await PostLike.destroy({
					where: {
						postId,
						userId: id,
					},
				});

				return res.status(200).send({
					success: true,
					message: 'Like comment success!',
					data: {},
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
	getPostLike: async (req, res) => {
		try {
			const result = await PostLike.findAll({
				attributes: [
					'postId',
					[sequelize.fn('COUNT', sequelize.col('postId')), 'total'],
				],
				group: 'postId',
			});
			return res.status(200).send({
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
	getLike: async (req, res) => {
		try {
			const { id } = req.user;

			const result = await PostLike.findAll({
				where: {
					userId: id,
				},
			});

			return res.status(200).send({
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
