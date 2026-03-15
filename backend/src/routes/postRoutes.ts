import express from 'express';
import {
    createPost,
    getPosts,
    getUserPosts,
    toggleLikePost,
    addComment,
    getPostComments,
    updatePost,
    deletePost,
    searchPosts
} from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req: any, file, cb) => {
        cb(null, `post-${req.user?._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Images only! (jpeg, jpg, png, webp, gif)'));
        }
    }
});

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of posts
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Content is required
 *       401:
 *         description: Not authorized
 */
router.route('/')
    .get(protect, getPosts)
    .post(protect, upload.array('images', 5), createPost);

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Search posts using AI embedding vector similarity
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query text
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of relevant posts matching the query
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Not authorized
 */
router.get('/search', protect, searchPosts);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: User not authorized to edit this post
 *       404:
 *         description: Post not found
 */
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post removed successfully
 *       403:
 *         description: User not authorized to delete this post
 *       404:
 *         description: Post not found
 */
router.route('/:id')
    .put(protect, upload.array('images', 5), updatePost)
    .delete(protect, deletePost);

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get all posts by a specific user
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of posts by user
 *       401:
 *         description: Not authorized
 */
router.get('/user/:userId', protect, getUserPosts);

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Toggle like status on a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated likes array
 *       404:
 *         description: Post not found
 */
router.post('/:id/like', protect, toggleLikePost);

/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: Post not found
 */
/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Content is required
 *       404:
 *         description: Post not found
 */
router.route('/:id/comments')
    .get(protect, getPostComments)
    .post(protect, addComment);

export default router;
