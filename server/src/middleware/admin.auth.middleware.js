import { Admin} from '../models/admin.model.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request: No token provided" });
        }
        console.log(process.env.ACCESS_TOKEN_SECRET);
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            return res.status(401).json({ message: "Unauthorized request: Invalid token" });
        }
        req.user = { id: decodedToken._id };
        console.log(token,decodedToken._id);
        Admin.findById(decodedToken._id).select("-password -refreshToken").then(user => {
            if (!user) {
                return res.status(401).json({ message: "Unauthorized request: User not found" });
            }

            req.user = user;
            next();
        }).catch(error => {
            return res.status(500).json({ message: "Internal Server Error" });
        });

    } catch (error) {
        return res.status(401).json({ message: error.message || "Unauthorized request: Invalid token" });
    }
};

// Export alias for admin authentication
export const verifyAdminJWT = verifyJWT;
