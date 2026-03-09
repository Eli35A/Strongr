import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '15m'
    });
};

describe('Users API', () => {
    let userToken: string;
    let testUser: any;

    beforeEach(async () => {
        await User.deleteMany({});

        testUser = await User.create({
            username: 'test_user',
            email: 'test_user@example.com',
            password: 'password123',
        });

        userToken = generateToken(testUser._id.toString());
    });

    describe('GET /users/profile', () => {
        it('should get user profile', async () => {
            const res = await request(app)
                .get('/users/profile')
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('test_user@example.com');
            expect(res.body.password).toBeUndefined();
        });

        it('should fail without token', async () => {
            const res = await request(app).get('/users/profile');
            expect(res.status).toBe(401);
        });
    });

    describe('PUT /users/profile', () => {
        it('should update user profile', async () => {
            const res = await request(app)
                .put('/users/profile')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({
                    username: 'updated_user',
                });

            expect(res.status).toBe(200);
            expect(res.body.username).toBe('updated_user');

            const user = await User.findById(testUser._id);
            expect(user?.username).toBe('updated_user');
        });

        it('should fail without token', async () => {
            const res = await request(app).put('/users/profile').send({ username: 'updated_user' });
            expect(res.status).toBe(401);
        });
    });

    describe('POST /users/profile/avatar', () => {
        it('should upload avatar and return path', async () => {
            const buffer = Buffer.from('mock image');

            const res = await request(app)
                .post('/users/profile/avatar')
                .set('Cookie', [`accessToken=${userToken}`])
                .attach('avatar', buffer, 'avatar.png');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Avatar uploaded successfully');
            expect(res.body.profileImage).toMatch(/^\/uploads\//);
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .post('/users/profile/avatar')
                .attach('avatar', Buffer.from('mock image'), 'avatar.png');
            expect(res.status).toBe(401);
        });
    });
});
