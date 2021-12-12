const User = require("../models/User");
const HobbyUserMapper = require("../models/HobbyUserMapper");
const listOfHobbies = require("../models/listHobbies");
const UserLocationMapper = require("../models/UserLocationMapper");


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

exports.getAllHobbies = async (req, res, next) => {
    try{

        let hobbyList = await listOfHobbies.find({});
        res.status(200).json(hobbyList);
    }
    catch(e){
        next(e);
    }
}

exports.getUserById = async (req, res, next) => {
    try{
        let id = req.params.userId;
        let user = await User.findOne({_id:id});
        res.status(200).json(user);
    }
    catch(e){
        next(e);
    }
}

exports.getUsersListByHobbyAndLocation = async (req, res, next) => {
    let listOfHobbies = req.user.listOfHobbies;
    let userLocation = req.user.locationCity;
    try{
        let locationMatchedUsers = [];
        await UserLocationMapper.findOne({locationCity:userLocation}).then(async result=>{
            locationMatchedUsers = result.listOfUsers;
        }).then(async ()=>{
            let userList = [];
            for(let i=0;i<listOfHobbies.length; i++){
                let hobbyUser = await HobbyUserMapper.findOne({hobbyId:listOfHobbies[i].hobbyId});
                userList.push(...hobbyUser.listOfUsers);
            }
            userList = userList.filter(e => e !== req.user._id.toString());
            userList = [...new Set(userList)];
            const filteredArray = userList.filter(value => locationMatchedUsers.includes(value));
            filteredUsers = [];
            for(let i=0;i<filteredArray.length;i++){
                let user = await User.findOne({_id:filteredArray[i]});
                    filteredUsers.push(user);
            }

            res.status(200).json({
                success: true,
                listOfUsers: filteredUsers
            });
        });
    }
    catch(e){
        next(e)
    }
}


