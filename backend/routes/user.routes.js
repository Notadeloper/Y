import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getUserProfile, getSuggestedUsers, updateUser, bookmarkUnbookmarkPost, getBookmarkedPosts } from "../controllers/user.controller.js";

const router = express.Router()

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);
// Modifies User so belongs here IMO
router.post("/bookmark/:postId", protectRoute, bookmarkUnbookmarkPost);
router.get("/bookmarks/:id", protectRoute, getBookmarkedPosts);


export default router;