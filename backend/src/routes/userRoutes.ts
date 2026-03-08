import express from 'express';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req: any, file, cb) => {
        cb(null, `${req.user?._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Images only! (jpeg, jpg, png, webp)'));
        }
    }
});

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.post('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
