import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/generateToken';
import jwt from 'jsonwebtoken';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        if (user) {
            const accessToken = generateTokens(res, user._id as unknown as string);
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                accessToken
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            const accessToken = generateTokens(res, user._id as unknown as string);
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                accessToken
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

export const refreshToken = (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret') as { userId: string };
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '15m'
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, invalid refresh token' });
    }
};
