import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const accountmanagerSchema = new Schema({
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
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'AccountManager'
    },
    refreshToken: {
        type: String,
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'disabled'],
        default: 'disabled'
    },

}, { timeStamps: true });

accountmanagerSchema.pre("save", 
    async function(next) {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 8);
        }
        next();
    
})

accountmanagerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

accountmanagerSchema.methods.generateAccessToken = function () {
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

accountmanagerSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d",
        }
    )
}

export const AccountManager = mongoose.model('AccountManager', accountmanagerSchema);