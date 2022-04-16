const User = require('../models/User');
const Post = require('../models/Post');

exports.register = async (req, res) => {
    try {

        const { name, email, password } = req.body;
        let user = await User.findOne({ email: email });
        if (user) {
            res.status(400).json({
                success: false,
                message: "User already registered"
            })
        };


        user = new User({
            name, email, password, avatar: {
                public_id: "a",
                url: "a"
            }
        })

        user = await user.save();

        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }

        const token = await user.generateToken();

        res.status(201).cookie("token", token, options).json({
            success: true,
            user,
            token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }


};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Please Register first'
            })

        }
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or password"
            })
        }

        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }

        const token = await user.generateToken();


        res.status(200).cookie("token", token, options).json({
            success: true,
            user,
            token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.logout = async (req, res) => {
    try {

        res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).json({
            success: true,
            message: "User logout successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}



exports.followAndUnfollowUser = async (req, res) => {

    try {
        const user = await User.findById(req.params.id);
        const followingUser = await User.findById(req.user._id);

        // if (req.params.id.toString() === req.user._id.toString()) {
        //     return res.status(400).json({
        //         success: false, message: "You cannot follow yourself"
        //     })

        // }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (followingUser.following.includes(user._id)) {
            const index = user.followers.indexOf(req.user._id);
            const followingindex = followingUser.following.indexOf(user.id);

            user.followers.splice(index, 1);
            followingUser.following.splice(followingindex, 1);

            await user.save();
            await followingUser.save();

            res.status(200).json({
                success: true,
                message: "user unfollowed successfully"
            })
        } else {
            user.followers.push(req.user._id);
            followingUser.following.push(user._id);
            await user.save();
            await followingUser.save();

            res.status(200).json({
                success: true,
                message: "user followed successfully"
            })
        }





    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide old and a new password'
            })
        }
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect old password'
            })
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { name, email } = req.body;
        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        // user avatar to do

        await user.save();
        res.status(200).json({
            success: true,
            message: " profile updated successfully"
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;

        await user.remove();
        // Logout user after deleting profile
        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });



        // Delete all posts of the user
        for (let i = 0; i < posts.length; i++) {

            const post = await Post.findById(posts[i]);
            await post.remove();
        }

        // Removing users from followers following 

        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.save();

        }

        // Removing users from followings follower

        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);
            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
            await follows.save();

        }


        res.status(200).json({ success: true, message: 'Profile deleted successfully' });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

exports.myProfile = async (req, res) => {

    try {
        const user = await User.findById(req.user._id).populate("posts");
        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

exports.getUserProfile = async (req, res) => {

    try {
        const user = await User.findById(req.params.id).populate("posts");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

exports.getAllUsers = async (req, res) => {

    try {
        const users = await User.find({});

        res.status(200).json({ success: true, users })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
} 