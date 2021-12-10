
const User = require("../models/User");
require("dotenv").config();
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require("crypto");
const UserLocationMapper = require("../models/UserLocationMapper");


exports.register = async (req, res, next) => {
    const {email, password, firstName, lastName, phoneNumber, coOrds, locationCity, listOfHobbies} = req.body;
    try{
        const addedOn = Date.now();
        const displayName = firstName +" "+ lastName;
        const user = await User.create({
            email, password, firstName, lastName, addedOn, displayName, phoneNumber, coOrds, locationCity, listOfHobbies
        });
        let userLocationMap = await UserLocationMapper.find({locationCity: locationCity});
        sendToken(user, 201, res);
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

       sendToken(user, 200, res);

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
        console.log(user);
        const resetUrl = `http://${process.env.BASE_URL}/api/auth/passwordReset/${resetToken}`;
        const message = `
        <h1>Password Reser</h1>
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