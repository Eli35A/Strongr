import { Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateEmbedding, cosineSimilarity, SEARCH_THRESHOLD } from '../utils/aiService';

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { content } = req.body;

        const images: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            (req.files as Express.Multer.File[]).forEach(file => {
                images.push(`/uploads/${file.filename}`);
            });
        }

        if (!content && images.length === 0) {
            return res.status(400).json({ message: 'Content or images are required' });
        }

        const embedding = content ? await generateEmbedding(content) : [];


        const newPost = new Post({
            author: req.user?._id,
            content,
            images,
            embedding
        });

        const savedPost = await newPost.save();
        await savedPost.populate('author', 'username profileImage');

        const postObj = savedPost.toObject();
        res.status(201).json({ ...postObj, commentCount: 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalPosts = await Post.countDocuments();

        const posts = await Post.find()
            .populate('author', 'username profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const postsWithCounts = await Promise.all(
            posts.map(async (post) => {
                const commentCount = await Comment.countDocuments({ post: post._id });
                return { ...post, commentCount };
            })
        );

        res.json({
            posts: postsWithCounts,
            hasMore: totalPosts > skip + posts.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching posts' });
    }
};

export const getUserPosts = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalPosts = await Post.countDocuments({ author: req.params.userId });

        const posts = await Post.find({ author: req.params.userId })
            .populate('author', 'username profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const postsWithCounts = await Promise.all(
            posts.map(async (post) => {
                const commentCount = await Comment.countDocuments({ post: post._id });
                return { ...post, commentCount };
            })
        );

        res.json({
            posts: postsWithCounts,
            hasMore: totalPosts > skip + posts.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching user posts' });
    }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to edit this post' });
        }

        const { content } = req.body;
        if (content !== undefined) {
            post.content = content;
            if (content) {
                post.embedding = await generateEmbedding(content);
            } else {
                post.embedding = [];
            }
        }

        let currentImages: string[] = [];
        const { existingImages } = req.body;

        if (existingImages) {
            currentImages = Array.isArray(existingImages) ? existingImages : [existingImages];
        }

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const newImages = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
            currentImages = [...currentImages, ...newImages];
        }

        post.images = currentImages;

        const updatedPost = await post.save();
        await updatedPost.populate('author', 'username profileImage');

        res.json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating post' });
    }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this post' });
        }

        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();

        res.json({ message: 'Post removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting post' });
    }
};

export const toggleLikePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user?._id;

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ likes: post.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error liking post' });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = new Comment({
            post: post._id,
            author: req.user?._id,
            content
        });

        let savedComment = await newComment.save();
        savedComment = await savedComment.populate('author', 'username profileImage');

        res.status(201).json(savedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding comment' });
    }
};

export const getPostComments = async (req: AuthRequest, res: Response) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate('author', 'username profileImage')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching comments' });
    }
};

export const searchPosts = async (req: AuthRequest, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const queryEmbedding = await generateEmbedding(query);

        const allPosts = await Post.find()
            .select('+embedding')
            .populate('author', 'username profileImage')
            .lean() as any[];

        let scoredPosts = allPosts.map(post => {
            const similarity = (post.embedding && post.embedding.length > 0)
                ? cosineSimilarity(queryEmbedding, post.embedding)
                : 0;
            return { ...post, similarity };
        });

        scoredPosts = scoredPosts.filter(post => post.similarity > SEARCH_THRESHOLD);
        scoredPosts.sort((a, b) => b.similarity - a.similarity);

        scoredPosts.forEach(post => {
            delete post.embedding;
            delete post.similarity;
        });

        const totalPosts = scoredPosts.length;
        const pagedPosts = scoredPosts.slice(skip, skip + limit);

        const postsWithCounts = await Promise.all(
            pagedPosts.map(async (post) => {
                const commentCount = await Comment.countDocuments({ post: post._id });
                return { ...post, commentCount };
            })
        );

        res.json({
            posts: postsWithCounts,
            hasMore: totalPosts > skip + pagedPosts.length,
            keywordsUsed: [query]
        });

    } catch (error) {
        console.error('Server error during search:', error);
        res.status(500).json({ message: 'Server error parsing search request' });
    }
};
