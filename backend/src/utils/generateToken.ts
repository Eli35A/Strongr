import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateTokens = (res: Response, userId: string) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '15m'
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', {
        expiresIn: '7d'
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return { accessToken, refreshToken };
};
