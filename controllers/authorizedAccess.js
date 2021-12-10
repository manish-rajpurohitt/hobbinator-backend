const User = require("../models/User");
const HobbyUserMapper = require("../models/HobbyUserMapper");



exports.updateProfile = async (req, res, next) =>{
    let {firstName, lastName, email, phoneNumber } = req.body;
    let displayName = firstName + " " + lastName;
    try{
        let user = await User.updateOne({_id:req.user._id}, {
            $set : {"firstName" : firstName,
                    "lastName" : lastName,
                    "displayName" : displayName,
                    "email" : email,
                    "phoneNumber" : phoneNumber
                    }
            });
            res.status(200).json({
                success : true,
                data : "Updated Successfully"
            })
    }
    catch(e){
        next(e);
    }
}

exports.updateHobby = async (req, res, next) => {
    let listOfHobbies = req.body.listOfHobbies;
    try{
        let user = await User.find({_id:req.user._id});
        
        let previousList = user[0].listOfHobbies;
        let deletedHobbiesList = previousList.filter(function(o1){
            return !listOfHobbies.some(function(o2){
                return o1.hobbyName === o2.hobbyName;
            });
        });

        deletedHobbiesList.forEach(async hobby =>{
            let userListOfHobby = await HobbyUserMapper.find({hobbyId: hobby.hobbyId});
            console.log(userListOfHobby[0].listOfUsers);
            userListOfHobby[0].listOfUsers = userListOfHobby[0].listOfUsers.filter(user => user !== req.user._id.toString());
            console.log(userListOfHobby[0].listOfUsers);
            await HobbyUserMapper.update({hobbyId: hobby.hobbyId},{
                $set: { "listOfUsers" : userListOfHobby[0].listOfUsers}
            })
         });

         user = await User.updateOne({_id : req.user._id}, {
            $set : {"listOfHobbies" : listOfHobbies}
        });
        listOfHobbies.forEach(async hobby => {
            let users = await HobbyUserMapper.find({hobbyId: hobby.hobbyId});
            users[0].listOfUsers.push(req.user._id.toString());
            uniq = [...new Set(users[0].listOfUsers)];
            await HobbyUserMapper.update({hobbyId: hobby.hobbyId},{
                $set : {"listOfUsers" : uniq}
            });
        });

        res.status(200).json({
            success : true,
            data : "Updated Successfully"
        })
    }
    catch(e){
        next(e);

    }
}


