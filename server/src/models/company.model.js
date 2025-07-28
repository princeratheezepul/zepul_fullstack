import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String, 
    },
    website:{
        type:String 
    },
    location:{
        type:String 
    },
    domain: {
        type: String
    },
    companyType: {
        type: String
    },
    directorName: {
        type: String
    },
    founderName: {
        type: String
    },
    internalNotes: {
        type: String
    },
    aboutSection: {
        type: String
    },
    employeeNumber: {
        type: String
    },
    contact:{
        type:Number
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },

    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin',
    },
    isAssigned:{
      type: Boolean,
      default: false,
    },
     assignedTo: [
  {
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      default: "",
    }
  }
],

    // New field for assigned managers
    assignedManagers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],

    // managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

},{timestamps:true})
export const Company = mongoose.model("Company", companySchema);