
const User = require("../models/User");
require("dotenv").config();
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require("crypto");
const UserLocationMapper = require("../models/UserLocationMapper");
const axios = require('axios');




exports.register = async (req, res, next) => {
    
    try{
        const addedOn = Date.now();
        const displayName = req.body.firstName +" "+ req.body.lastName;
        let locationCity = "";
        await axios.get(`https://api.postalpincode.in/pincode/${req.body.locationCity}`)
        .then(response => {
            locationCity = response.data[0].PostOffice[0].District;
        })
        .catch(error => {
            next(error);
        });
        const user = await User.create({...req.body,displayName, locationCity});
        console.log(user);

        let userLocationMap = await UserLocationMapper.findOne({locationCity: locationCity});
        if(userLocationMap === null)
            userLocationMap = await UserLocationMapper.create({locationCity:locationCity, listOfUsers:[]});

        userLocationMap.listOfUsers.push(user._id.toString());
        await UserLocationMapper.update({locationCity:locationCity}, {
            $set : {"listOfUsers": userLocationMap.listOfUsers}
        });
        sendToken(user, 201, res);
        return
    }
    catch(e){
        next(e);
    }
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password)
       return next(new ErrorResponse("Please provide email and password.", 400))
    try{
        const user = await User.findOne({email}).select("+password");
        if(!user)
            return next(new ErrorResponse("Invalid credentials", 401))
       const isMatched = await user.matchPasswords(password);

        if(!isMatched)
            return next(new ErrorResponse("Invalid credentials", 401))

            const token = user.getSignedToken();
            user.password = "";
            res.status(200).json({
                success: true,
                token,
                user
            })

    }
    catch(e){
        res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

exports.forgotpassword = async (req, res, next) => {
    const {email} = req.body;
    console.log(email)
    try{
        const user = await User.findOne({email});
        if(!user)
            return next(new ErrorResponse("Email couldn't be send", 404));
            console.log(user);
        const resetToken = user.getResetPasswordToken();
        await user.save();
        const resetUrl = `https://${process.env.BASE_URL}/resetPassword/${resetToken}`;
        const message = `
        <h1>Password Reset</h1>
        <p>You have requested to reset your password. please click here to reset your password :</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;
        console.log("trying");
        try{
            await sendEmail({
                to:user.email,
                subject: "Password Reset Request",
                text: message
            });

            res.status(200).json({success: true, data:"Email sent"})
        }catch(e){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();
            return next(new ErrorResponse("Email couldn't be sent", 500))

        }
    }
    catch(e){
        return next(e);
    }
}

exports.resetpassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
    console.log(resetPasswordToken);
    try{
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()}
        })

        if(!user)
            return next(new ErrorResponse("Invalid reset token", 400));

        user.password = req.body.password;
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;

        await user.save();
        res.status(201).json({
            success: true,
            data: "Password reset success"
        });
    }catch(e){
        next(e)
    }
}


const sendToken = (user, statusCode, res)=>{
    const token = user.getSignedToken(); 
    res.status(statusCode).json({
        success: true,
        token
    })
}