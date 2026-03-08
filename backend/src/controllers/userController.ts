import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import path from 'path';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                profileImage: updatedUser.profileImage,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id);

        if (user) {
            if (req.file) {
                user.profileImage = `/uploads/${req.file.filename}`;
                await user.save();

                res.json({
                    message: 'Avatar uploaded successfully',
                    profileImage: user.profileImage
                });
            } else {
                res.status(400).json({ message: 'No image file uploaded' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error uploading avatar' });
    }
};
