const express = require('express');
const router = express.Router();

const { postController } = require('./../Controllers');
const { verifyToken } = require('../Middleware/auth');
const { postUpload } = require('../Middleware/multerPost');

// IMPORT ROUTER
router.post(
	'/',
	verifyToken,
	postUpload.single('image'),
	postController.createPost
);
router.get('/', postController.getAllPost);
router.patch(
	'/edit/:postId',
	verifyToken,
	postUpload.single('image'),
	postController.editPost
);
router.delete(
	'/delete/:postId',
	verifyToken,
	postUpload.single('image'),
	postController.deletePost
);
router.get('/user', verifyToken, postController.getUserPost);
router.get('/detail/:postId', postController.postDetail);
router.post('/comment', verifyToken, postController.createComment);
router.get('/comment', postController.getComment);
router.patch('/comment/edit', verifyToken, postController.editComment);
router.delete('/comment/delete', verifyToken, postController.deleteComment);
router.post('/like', verifyToken, postController.likePost);
router.delete('/like', verifyToken, postController.unlikePost);
router.get('/like', postController.getPostLike);
router.get('/user/like', verifyToken, postController.getLike);

module.exports = router;
