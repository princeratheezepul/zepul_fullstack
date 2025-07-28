import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    type:{
        type: String,
        default: 'admin',
    },
    refreshToken: {
        type: String,
    },
    // Additional profile fields
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    phone: {
        type: String,
    },
    profileImage: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'disabled'],
        default: 'active'
    },
    jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],

}, { timeStamps: true });

adminSchema.pre("save", 
    async function(next) {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 8);
        }
        next();
    
})

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

adminSchema.methods.generateAccessToken = function () {
    console.log(process.env.ACCESS_TOKEN_SECRET);
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "24h",
        }
    )
}

adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d",
        }
    )
}

export const Admin = mongoose.model('Admin', adminSchema);