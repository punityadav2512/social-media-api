const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {

    try {
        let post = new Post({
            caption: req.body.caption,
            image: {
                public_id: 'req.body.public_id',
                url: 'req.body.url'
            },
            owner: req.user._id,

        });

        post = await post.save();
        const user = await User.findById(req.user._id);
        user.posts.push(post._id);

        await user.save();

        res.status(200).json({
            success: true,
            post

        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.deletePost = async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        const user = await User.findById(req.user._id);

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const index = user.posts.indexOf(post._id);
        user.posts.splice(index, 1);
        await post.remove();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message
        })

    }
}

exports.likeAndUnlikePost = async (req, res) => {

    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }


        if (post.likes.includes(req.user._id)) {
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index, 1);
            await post.save();

            return res.status(200).json({
                success: true,
                mesage: 'Post disliked successfully'
            })
        }

        post.likes.push(req.user._id);

        await post.save();

        return res.status(200).json({
            success: true,
            message: 'Post liked successfully'
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getPostOfFollowing = async (req, res) => {

    try {
        const user = await User.findById(req.user._id);
        const posts = await Post.find({
            owner: {
                $in: user.following
            }
        })

        return res.status(200).json({
            success: true,
            posts
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updateCaption = async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        if (post.owner.toString() !== req.user._id.toString()) {

            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({ success: true, message: "Post updated successfully" })



    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

exports.commentOnPost = async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "No post found"
            })
        }

        let commentIndex = -1;
        post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user._id.toString()) {
                commentIndex = index;
            }
        })

        if (commentIndex !== -1) {
            post.comments[commentIndex].comment = req.body.comment;
            await post.save();

            return res.status(200).json({
                success: true,
                message: "comment updated successfully"
            })


        } else {
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment
            })

        }
        await post.save();
        return res.status(200).json({
            success: true,
            message: "comment added successfully"
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}