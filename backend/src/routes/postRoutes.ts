import express from 'express';
import {
    createPost,
    getPosts,
    getUserPosts,
    toggleLikePost,
    addComment,
    getPostComments,
    updatePost,
    deletePost
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

router.route('/')
    .get(protect, getPosts)
    .post(protect, upload.single('image'), createPost);

router.route('/:id')
    .put(protect, upload.single('image'), updatePost)
    .delete(protect, deletePost);

router.get('/user/:userId', protect, getUserPosts);

router.post('/:id/like', protect, toggleLikePost);

router.route('/:id/comments')
    .get(protect, getPostComments)
    .post(protect, addComment);

export default router;
