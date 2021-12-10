const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth");
const {updateProfile, updateHobby} = require("../controllers/authorizedAccess");

router.route("/updateProfile").post(protect, updateProfile);
router.route("/updateHobby").post(protect, updateHobby);


module.exports = router