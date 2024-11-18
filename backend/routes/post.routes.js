import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { 
    createPost,
    deletePost, 
    commentPost, 
    likeUnlikePost, 
    getAllPosts, 
    getLikedPosts, 
    getFollowingPosts, 
    getUserPosts 
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:postId", protectRoute, likeUnlikePost);
router.post("/comment/:postId", protectRoute, commentPost);
router.delete("/:postId", protectRoute, deletePost);

export default router;