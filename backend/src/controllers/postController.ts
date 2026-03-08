import { Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/authMiddleware';

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const newPost = new Post({
            author: req.user?._id,
            content,
            image: req.file ? `/uploads/${req.file.filename}` : undefined
        });

        const savedPost = await newPost.save();
        await savedPost.populate('author', 'username profileImage');

        res.status(201).json(savedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username profileImage')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching posts' });
    }
};

export const getUserPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate('author', 'username profileImage')
            .sort({ createdAt: -1 });

        res.json(posts);
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
        if (content) {
            post.content = content;
        }

        if (req.file) {
            post.image = `/uploads/${req.file.filename}`;
        }

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
