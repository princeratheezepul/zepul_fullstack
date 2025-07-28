import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request: No token provided" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            return res.status(401).json({ message: "Unauthorized request: Invalid token" });
        }
        req.id = decodedToken._id;
        console.log('Manager auth middleware - Token:', token);
        console.log('Manager auth middleware - Decoded ID:', decodedToken._id);
        
        User.findById(decodedToken._id).select("-password -refreshToken").then(user => {
            if (!user) {
                return res.status(401).json({ message: "Unauthorized request: User not found" });
            }

            // Check if user is a manager
            if (user.type !== 'manager') {
                return res.status(403).json({ message: "Access denied: Manager role required" });
            }

            req.user = user;
            req.role = user.type; // Add role information
            next();
        }).catch(error => {
            console.error('Manager auth middleware - Database error:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        });

    } catch (error) {
        console.error('Manager auth middleware - JWT verification error:', error);
        return res.status(401).json({ message: error.message || "Unauthorized request: Invalid token" });
    }
};
