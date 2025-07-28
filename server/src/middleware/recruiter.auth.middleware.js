import Recruiter from "../models/recruiter.model.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

export const verifyRecruiterJWT = (req, res, next) => {
    try {
        const token = req.cookies?.recruiterToken || req.header("Authorization")?.replace("Bearer ", "");
        
        console.log('Recruiter auth middleware - Token found:', !!token);
        console.log('Recruiter auth middleware - Cookies:', req.cookies);
        console.log('Recruiter auth middleware - All headers:', req.headers);
        console.log('Recruiter auth middleware - Cookie header:', req.headers.cookie);

        if (!token) {
            console.log('Recruiter auth middleware - No token provided');
            return res.status(401).json({ message: "Unauthorized request: No token provided" });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log('Recruiter auth middleware - Decoded token:', decodedToken);
        
        if (!decodedToken) {
            console.log('Recruiter auth middleware - Invalid token');
            return res.status(401).json({ message: "Unauthorized request: Invalid token" });
        }
        
        req.id = decodedToken.id;
        req.role = 'recruiter'; // Add role for the resume stats function
        console.log('Recruiter auth middleware - User ID:', decodedToken.id);
        console.log('Recruiter auth middleware - User Role:', req.role);
        
        Recruiter.findById(decodedToken.id).select("-password").then(recruiter => {
            console.log('Recruiter auth middleware - Found recruiter:', !!recruiter);
            if (!recruiter) {
                return res.status(401).json({ message: "Unauthorized request: Recruiter not found" });
            }

            req.user = recruiter;
            next();
        }).catch(error => {
            console.error('Recruiter auth middleware - Database error:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        });

    } catch (error) {
        console.error('Recruiter auth middleware - JWT verification error:', error);
        return res.status(401).json({ message: error.message || "Unauthorized request: Invalid token" });
    }
}; 