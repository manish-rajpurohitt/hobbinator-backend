const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth");
const {updateProfile, updateHobby, getAllHobbies, getUserById, getUsersListByHobbyAndLocation} = require("../controllers/authorizedAccess");

router.route("/updateProfile").post(protect, updateProfile);
router.route("/hobby/updateHobby").post(protect, updateHobby);
router.route("/hobby/getAllHobbies").get(protect, getAllHobbies);
router.route("/getUserById/:userId").get(protect,getUserById);

router.route("/fetchUserWithHobbiesAndLocation").get(protect, getUsersListByHobbyAndLocation)

module.exports = router

