import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select("-password");
        if (!user) return res.status(400).json({ error: "User not found!" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in getUserProfile: ", error.message);
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = req.user;

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself!" });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User Not Found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user_id}});
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id }});
            
            res.status(200).json( { message: "User unfollowed successfully" });

        } else {
            // follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id }});
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id }});
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })

            await newNotification.save();

            res.status(200).json( { message: "User followed successfully" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in followUnfollowUser: ", error.message);
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const usersFollowedByMe = req.user.following;

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: req.user._id }
                }
            },
            { 
                $sample: { 
                    size: 10 
                }
            }
        ])

        const filteredUsers = users.filter(user => !usersFollowedByMe.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));
        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in getSuggestedUsers: ", error.message);
    }
}

export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    try {
        let user = await User.findById(req.user._id);
        if (!user) return res.status(404).json( { error: "User not found" });

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json( { error: "Please provide current password and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long "});
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword.toString(), salt);
        }


        if (profileImg) {
            if (user.profileImg) {
                // Extracting image id
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        // Update all values
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        // This doesn't get updated, just when returning password is hidden
        user.password = null;

        return res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in updateUser: ", error.message);
    }
}

export const bookmarkUnbookmarkPost = async (req, res) => {
    try {
        const user = req.user
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }

        const isBookmarked = user.bookmarkedPosts.includes(postId);
        
        if (isBookmarked) {
            user.bookmarkedPosts = user.bookmarkedPosts.filter((id) => id.toString() !== postId);
            await user.save();
        } else {
            user.bookmarkedPosts.push(postId);
            await user.save();
        }
        return res.status(200).json(user.bookmarkedPosts);

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("Error in bookmarkUnbookmarkPost: ", error.message);
    }
}

export const getBookmarkedPosts = async (req, res) => {
    try {
        const user = req.user;

        const bookmarkedPosts = await Post.find({ _id: {$in: user.bookmarkedPosts }})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(bookmarkedPosts);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log("Error in getBookmarkedPosts: ", error.message);
    }
}