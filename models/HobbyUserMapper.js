const mongoose = require('mongoose');
const Hobby = require("./Hobby");
const HobbyUserMapperSchema = mongoose.Schema({
    hobbyName : {
        type: String,
        required: true
    },
    hobbyId : {
        type : String,
        required : true
    },
    listOfUsers: {
        type: Array,
        require: true
    }
});

let HobbyUserMapper = mongoose.model("HobbyUserMapperCollection", HobbyUserMapperSchema);
module.exports = HobbyUserMapper