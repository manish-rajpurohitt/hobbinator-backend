const mongoose = require('mongoose');

const HobbySchema = mongoose.Schema({
    hobbyName : {
        type : String,
        required : true
    },
    hobbyId : {
        type: String,
        required: true
    }
});
module.exports = HobbySchema