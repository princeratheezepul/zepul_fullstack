import { Admin } from '../models/admin.model.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const verifyMultiJWT = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized request: No token provided" });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized request: Invalid token" });
    }
    // Try admin first
    Admin.findById(decodedToken._id).select("-password -refreshToken").then(admin => {
      if (admin) {
        req.user = admin;
        req.role = "admin";
        return next();
      }
      // Try manager
      User.findById(decodedToken._id).select("-password -refreshToken").then(user => {
        if (user && user.type === "manager") {
          req.user = user;
          req.role = "manager";
          return next();
        }
        return res.status(403).json({ message: "Access denied: Admin or Manager role required" });
      });
    });
  } catch (error) {
    return res.status(401).json({ message: error.message || "Unauthorized request: Invalid token" });
  }
}; 