const mongoose = require("mongoose");

const listOfHobbiesSchema = mongoose.Schema({
    hobbyName : {
        type: String,
        require : true
    }
});

let listHobbies = mongoose.model("listOfHobbies", listOfHobbiesSchema);

module.exports = listHobbies;