import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';

jest.mock('google-auth-library');

describe('Auth API', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app).post('/auth/register').send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.username).toBe('testuser');
            expect(res.body.email).toBe('test@example.com');

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user).toBeTruthy();
        });

        it('should return 400 if user already exists', async () => {
            await User.create({
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password123',
            });

            const res = await request(app).post('/auth/register').send({
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password123',
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/auth/register').send({
                username: 'loginuser',
                email: 'login@example.com',
                password: 'password123',
            });
        });

        it('should login standard user successfully', async () => {
            const res = await request(app).post('/auth/login').send({
                email: 'login@example.com',
                password: 'password123',
            });

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('login@example.com');

            const cookies = res.headers['set-cookie'] as unknown as string[];
            expect(cookies).toBeDefined();
            expect(cookies.some((cookie: string) => cookie.includes('accessToken'))).toBeTruthy();
            expect(cookies.some((cookie: string) => cookie.includes('refreshToken'))).toBeTruthy();
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app).post('/auth/login').send({
                email: 'login@example.com',
                password: 'wrongpassword',
            });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout user and clear cookies', async () => {
            const res = await request(app).post('/auth/logout');
            expect(res.status).toBe(200);

            const cookies = res.headers['set-cookie'] as unknown as string[];
            expect(cookies).toBeDefined();
            expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBeTruthy();
            expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBeTruthy();
        });
    });

    describe('POST /auth/google', () => {
        it('should login or create user via Google OAuth', async () => {
            OAuth2Client.prototype.verifyIdToken = jest.fn().mockResolvedValue({
                getPayload: () => ({
                    sub: 'google123',
                    email: 'google@example.com',
                    name: 'Google User',
                    picture: 'profile.jpg',
                }),
            });

            const res = await request(app).post('/auth/google').send({
                credential: 'mocked_google_token',
            });

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('google@example.com');

            const cookies = res.headers['set-cookie'] as unknown as string[];
            expect(cookies).toBeDefined();
        });
    });

    describe('POST /auth/refresh', () => {
        it('should generate new access token', async () => {
            await request(app).post('/auth/register').send({
                username: 'refreshuser',
                email: 'refresh@example.com',
                password: 'password123',
            });

            const loginRes = await request(app).post('/auth/login').send({
                email: 'refresh@example.com',
                password: 'password123',
            });

            const cookies = loginRes.headers['set-cookie'] as unknown as string[];
            const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken=')) || '';

            const res = await request(app)
                .post('/auth/refresh')
                .set('Cookie', [refreshTokenCookie]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const newCookies = res.headers['set-cookie'] as unknown as string[];
            expect(newCookies.some((c: string) => c.includes('accessToken='))).toBeTruthy();
        });
    });
});
