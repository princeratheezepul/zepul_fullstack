import { Admin } from '../models/admin.model.js';
import { User } from '../models/user.model.js';
import Recruiter from '../models/recruiter.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "your_secret_key_here";

export const multiAuthMiddleware = (req, res, next) => {
  try {
    // Check for token in multiple places for compatibility
    const token = req.cookies?.recruiterToken || 
                 req.cookies?.accessToken || 
                 req.header("Authorization")?.replace("Bearer ", "");

    console.log('Multi auth middleware - Token found:', !!token);
    console.log('Multi auth middleware - Token value:', token ? token.substring(0, 20) + '...' : 'none');

    if (!token) {
      console.log('Multi auth middleware - No token provided');
      return res.status(401).json({ message: "Unauthorized request: No token provided" });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log('Multi auth middleware - Decoded token:', decodedToken);
    
    if (!decodedToken) {
      console.log('Multi auth middleware - Invalid token');
      return res.status(401).json({ message: "Unauthorized request: Invalid token" });
    }

    // Try to find user in different collections
    Promise.all([
      Recruiter.findById(decodedToken.id || decodedToken._id).select("-password"),
      User.findById(decodedToken.id || decodedToken._id).select("-password"),
      Admin.findById(decodedToken.id || decodedToken._id).select("-password")
    ]).then(([recruiter, user, admin]) => {
      if (recruiter) {
        req.user = recruiter;
        req.id = recruiter._id;
        req.role = 'recruiter';
        console.log('Multi auth middleware - Found recruiter:', recruiter._id);
        return next();
      } else if (user && user.type === 'manager') {
        req.user = user;
        req.id = user._id;
        req.role = 'manager';
        console.log('Multi auth middleware - Found manager:', user._id);
        return next();
      } else if (admin) {
        req.user = admin;
        req.id = admin._id;
        req.role = 'admin';
        console.log('Multi auth middleware - Found admin:', admin._id);
        return next();
      } else {
        console.log('Multi auth middleware - No valid user found');
        return res.status(401).json({ message: "Unauthorized request: User not found" });
      }
    }).catch(error => {
      console.error('Multi auth middleware - Database error:', error);
      return res.status(500).json({ message: "Internal Server Error" });
    });

  } catch (error) {
    console.error('Multi auth middleware - JWT verification error:', error);
    return res.status(401).json({ message: error.message || "Unauthorized request: Invalid token" });
  }
};

// Keep the old export for backward compatibility
export const verifyMultiJWT = multiAuthMiddleware; 