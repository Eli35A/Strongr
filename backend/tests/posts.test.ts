import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import Post from '../src/models/Post';
import Comment from '../src/models/Comment';
import jwt from 'jsonwebtoken';
import ai from '../src/utils/gemini';

const generateToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '15m'
    });
};

jest.mock('../src/utils/gemini', () => ({
    __esModule: true,
    default: {
        models: {
            generateContent: jest.fn().mockResolvedValue({
                text: 'bench, barbell, heavy'
            })
        }
    }
}));

describe('Posts API', () => {
    let userToken: string;
    let otherUserToken: string;
    let testUser: any;
    let otherUser: any;
    let testPost: any;

    beforeEach(async () => {
        await User.deleteMany({});
        await Post.deleteMany({});
        await Comment.deleteMany({});

        testUser = await User.create({
            username: 'post_author',
            email: 'author@example.com',
            password: 'password123',
        });

        otherUser = await User.create({
            username: 'other_user',
            email: 'other@example.com',
            password: 'password123',
        });

        userToken = generateToken(testUser._id.toString());
        otherUserToken = generateToken(otherUser._id.toString());

        testPost = await Post.create({
            author: testUser._id,
            content: 'Initial test post for testing API',
            likes: [],
        });
    });

    describe('POST /posts', () => {
        it('should create a new post', async () => {
            const res = await request(app)
                .post('/posts')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({ content: 'My new shiny post' });

            expect(res.status).toBe(201);
            expect(res.body.content).toBe('My new shiny post');
            expect(res.body.author.username).toBe('post_author');
        });

        it('should upload an image when creating a post', async () => {
            const buffer = Buffer.from('mock image');
            const res = await request(app)
                .post('/posts')
                .set('Cookie', [`accessToken=${userToken}`])
                .field('content', 'Post with image')
                .attach('image', buffer, 'post.png');

            expect(res.status).toBe(201);
            expect(res.body.content).toBe('Post with image');
            expect(res.body.image).toMatch(/^\/uploads\//);
        });

        it('should fail if no content provided', async () => {
            const res = await request(app)
                .post('/posts')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('GET /posts', () => {
        it('should get a list of posts', async () => {
            const res = await request(app)
                .get('/posts')
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.posts.length).toBe(1);
            expect(res.body.posts[0].content).toBe('Initial test post for testing API');
            expect(res.body.posts[0].commentCount).toBe(0);
        });
    });

    describe('GET /posts/user/:userId', () => {
        it('should get posts by user', async () => {
            const res = await request(app)
                .get(`/posts/user/${testUser._id.toString()}`)
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.posts.length).toBe(1);
        });

        it('should return empty for user with no posts', async () => {
            const res = await request(app)
                .get(`/posts/user/${otherUser._id.toString()}`)
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.posts.length).toBe(0);
        });
    });

    describe('PUT /posts/:id', () => {
        it('should update a post if authorized', async () => {
            const res = await request(app)
                .put(`/posts/${testPost._id.toString()}`)
                .set('Cookie', [`accessToken=${userToken}`])
                .send({ content: 'Updated content string' });

            expect(res.status).toBe(200);
            expect(res.body.content).toBe('Updated content string');
        });

        it('should fail to update post if not author', async () => {
            const res = await request(app)
                .put(`/posts/${testPost._id.toString()}`)
                .set('Cookie', [`accessToken=${otherUserToken}`])
                .send({ content: 'Evil update' });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('User not authorized to edit this post');
        });
    });

    describe('DELETE /posts/:id', () => {
        it('should delete a post if authorized', async () => {
            const res = await request(app)
                .delete(`/posts/${testPost._id.toString()}`)
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Post removed successfully');

            const post = await Post.findById(testPost._id);
            expect(post).toBeNull();
        });

        it('should fail to delete post if not author', async () => {
            const res = await request(app)
                .delete(`/posts/${testPost._id.toString()}`)
                .set('Cookie', [`accessToken=${otherUserToken}`]);

            expect(res.status).toBe(403);
        });
    });

    describe('POST /posts/:id/like', () => {
        it('should toggle like on a post', async () => {
            const res1 = await request(app)
                .post(`/posts/${testPost._id.toString()}/like`)
                .set('Cookie', [`accessToken=${otherUserToken}`]);

            expect(res1.status).toBe(200);
            expect(res1.body.likes).toHaveLength(1);
            expect(res1.body.likes[0]).toBe(otherUser._id.toString());

            const res2 = await request(app)
                .post(`/posts/${testPost._id.toString()}/like`)
                .set('Cookie', [`accessToken=${otherUserToken}`]);

            expect(res2.status).toBe(200);
            expect(res2.body.likes).toHaveLength(0);
        });
    });

    describe('Comments API', () => {
        it('should add a comment to a post', async () => {
            const res = await request(app)
                .post(`/posts/${testPost._id.toString()}/comments`)
                .set('Cookie', [`accessToken=${otherUserToken}`])
                .send({ content: 'Nice post!' });

            expect(res.status).toBe(201);
            expect(res.body.content).toBe('Nice post!');
            expect(res.body.author.username).toBe('other_user');
        });

        it('should fetch comments for a post', async () => {
            await Comment.create({
                post: testPost._id,
                author: otherUser._id,
                content: 'Great post!',
            });

            const res = await request(app)
                .get(`/posts/${testPost._id.toString()}/comments`)
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].content).toBe('Great post!');
        });
    });

    describe('GET /posts/search', () => {
        beforeEach(async () => {
            await Post.create({
                author: testUser._id,
                content: 'Heavy barbell bench press max PR',
                likes: [],
            });
            await Post.create({
                author: testUser._id,
                content: 'I hate cardio day',
                likes: [],
            });
        });

        it('should search posts and use AI expansion', async () => {
            const res = await request(app)
                .get('/posts/search?q=squat')
                .set('Cookie', [`accessToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.posts.length).toBeGreaterThan(0);
            const contents = res.body.posts.map((p: any) => p.content);
            expect(contents).toContain('Heavy barbell bench press max PR');
            expect(ai.models.generateContent).toHaveBeenCalled();
            expect(res.body.keywordsUsed).toContain('bench');
        });
    });
});
