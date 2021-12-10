const express = require("express");
const router = express.Router();
const {register, login, forgotpassword, resetpassword} = require("../controllers/auth");



router.route("/register").post(register);
router.route("/login").post(login)
router.route("/forgotPassword").post(forgotpassword)
router.route("/passwordReset/:resetToken").post(resetpassword)

module.exports = router;

