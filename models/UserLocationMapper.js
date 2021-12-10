const mongoose = require('mongoose');
const User = require("./User");
const UserLocationMapperSchema = mongoose.Schema({
    locationCity : {
        type : String,
        required : true
    },
    listOfUsers : {
        type: Array,
        require : true
    }
});

const UserLocationMapper = mongoose.model("UserLocationMapperCollection", UserLocationMapperSchema);
module.exports = UserLocationMapper;