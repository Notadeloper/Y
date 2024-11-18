// This function protects a route by decoding a token
import User from "../models/user.model.js"
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        // Get token
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Unauthorised: No Token Provided" });
        }

        // Verify token with secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorised: Invalid Token!" });
        }

        // Find user with userId from decided token
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        // pass user into req (w/out password)
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({ error: "Invalid Server Error" });
    }
}