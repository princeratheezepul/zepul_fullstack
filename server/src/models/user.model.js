import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const userSchema = new Schema({
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
    refreshToken: {
        type: String,
    },
    adminId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        // required: true
    },
    managerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    type:{
        type: String,
        enum: ['recruiter', 'manager', 'accountmanager', 'admin'],
        default: 'manager'
    },
    address:{
        type:String,
    },
    department:{
        type:String,
        default: 'HR'
    },
    gender:{
        type:String 
    },
    DOB:{
        type:Date
    },
    phone:{
        type:Number
    },
    profile:{
        type:String
    },
    firstPassSet:{
        type: Boolean,
        default: false
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
    totalHires: {
        type: Number,
        default: 0
    },
    offersMade: {
        type: Number,
        default: 0
    },
    offersAccepted: {
        type: Number,
        default: 0
    },
    jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],
    // New field for assigned companies
    assignedCompany: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    }],
}, { timeStamps: true });

userSchema.pre("save", 
    async function(next) {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 8);
        }
        next();
    
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
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

userSchema.methods.generateRefreshToken = function () {
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

export const User = mongoose.models.User || mongoose.model('User', userSchema);