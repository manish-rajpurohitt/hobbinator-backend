const mongoose = require('mongoose');
const crypto = require('crypto');
const Hobby = require("./Hobby");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    firstName : {
        type:String,
        required: [true, "Please provide a first name"]
    },
    lastName : {
        type:String,
        required: [true, "Please provide a last name"]
    },
    displayName : {
        type:String
    },
    phoneNumber : {
        type:Number
    },
    email : {
        type:String,
        required: [true, "Please provide email"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email"
        ]
    },
    coOrds : {
        type: Array,
        required: true
    },
    locationCity : {
        type: String,
        required: true
    },
    listOfHobbies : [Hobby],
    password: {
        type:String,
        required:[true, "Please provide a password"],
        minlength:6,
        select: false
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    addedOn:{
        type: Date
    },
    updatedOn: {
        type: Date,
        default : Date.now
    }
});


UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

UserSchema.methods.matchPasswords = async function(password){
    let ress = await bcrypt.compare(password, this.password);
    return ress;
}

UserSchema.methods.getSignedToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

UserSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
    return resetToken;
}

const User = mongoose.model("Users", UserSchema);
module.exports = User;