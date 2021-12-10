const express = require("express");
const router = express.Router();
const {setupHobbyList, setupHobbyUserMapper} = require("../controllers/setupHobbyList");


router.route("/setupList").post(setupHobbyList);

router.route("/hobbyUserMapper").post(setupHobbyUserMapper);

module.exports = router;