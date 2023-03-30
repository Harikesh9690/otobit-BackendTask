const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
 
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "object" && Object.keys(value).length === 0) return false;
    return true;
}; 

const createuser = async function (req, res) {
    try {
        let data = req.body
        console.log(data)
        const { name, email, password} = data
        let passValid = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
        let emailValid = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        if (!isValid(data)) {
            return res.status(400).send({ status: false, msg: "You have not provided any data" })
        }
        if (!isValid(name)) {
            return res.status(400).send({ status: false, msg: "Please provide name. it's mandatory" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "Please provide email" })
        }
        if (!emailValid.test(email)) {
            return res.status(400).send({ status: false, msg: "Enter valid email" })
        }
        let usersemail = await userModel.findOne({ email: email })
        if (usersemail) {
            return res.status(400).send({ status: false, msg: "this email is already exist" })
        }
        if (!password) {
            return res.status(400).send({ status: false, msg: "Please provide password" })
        }
        if (!passValid.test(password)) {
            return res.send({ status: false, msg: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number" })
        }
        let savedata = await userModel.create(data)
        return res.status(201).send({ status: true, data: savedata })
    } catch (err) {
       return res.status(500).send({ status: false, err: err.message })
    }
}


const userlogin = async function (req, res) {
    try {
        let useremail = req.body.email
        let password = req.body.password
        let emailValid = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        if (!isValid(useremail)) {
            return res.status(400).send({ status: false, msg: "Please provide email" })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "Please provide password" })
        }
        if (!emailValid.test(useremail)) {
            return res.status(400).send({ status: false, msg: "Enter valid email" })
        }
        let userdetails = await userModel.findOne({ email: useremail.trim(), password: password.trim() })
        if (!userdetails) {
            return res.status(401).send({ status: false, error: "Emaild or the password is not correct" })
        }
        let token = jwt.sign(
            {
                userId: userdetails._id.toString(),
                firstbook: "the moutain",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 50*60*60
            },
            "this is very very secret key of otobit"
        )
       return res.status(200).send({ status: true, token: token });
    } catch (err) {
       return res.status(500).send({ err: err.message })
    }
}

const getUserList = async function(req, res){
    try {
        let userList = await userModel.find({isDeleted: false})
        if (userList.length == 0) {
            return res.status(404).send({ status: true, message: 'No user found' })
        }
        return res.status(200).send({data: userList, status: true})
    } catch (error) {
        return res.status(500).send({status: false, err: error.message })
    }
}

const userById = async function(req, res){
    try {
        let userId = req.params.Id
        if (!userId) {
            return res.status(400).send({status: false, msg: "please provide userId"})
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is not valid, please enter valid ID" })
         }
         let userdetails = await userModel.findOne({_id: userId, isDeleted: false})
         if (!userdetails) {
            return res.status(404).send({ status: false, msg: `user not found with this userId ->${userId}`})
        }
        return res.status(200).send({status: true, data: userdetails})
    } catch (error) {
        return res.status(500).send({status: false, err: error.message })
    }
}

const UpdateUserById = async function(req, res){
    try {
        let userId = req.params.Id
    if (!userId) {
        return res.status(400).send({status: false, msg: "please provide userId"})
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({ status: false, msg: "userId is not valid, please enter valid ID" })
    }
    if(req.pass.userId !== userId){
        return res.status(403).send({status: false, msg: "you are not authorised !!"})
    }
    let data = req.body
    let emailValid = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    if (data.email) {
        if (!emailValid.test(data.email)) {
            return res.status(400).send({ status: false, msg: "Enter valid email" })
        }
        let usersemail = await userModel.findOne({ email: data.email })
        if (usersemail) {
            return res.status(400).send({ status: false, msg: "this email is already exist" })
        }
    }
    if (data.password) {
        if (!passValid.test(password)) {
            return res.send({ status: false, msg: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number" })
        }
    }
    let updatedUser = await userModel.findOneAndUpdate(
        { _id: userId, isDeleted: false },
        { $set: { name: data.name, email: data.email, password: data.password } },
        { new: true })
      return res.status(200).send({ status: true, message: 'Success',data: updatedUser })
    } catch (error) {
        return res.status(500).send({status: false, err: error.message })
    }
}

const deleteUserById = async function(req, res){
    try {
        let userId = req.params.Id
        if (!userId) {
            return res.status(400).send({status: false, msg: "please provide userId"})
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is not valid, please enter valid ID" })
        }
        if(req.pass.userId !== userId){
            return res.status(403).send({status: false, msg: "you are not authorised !!"})
        }
         await userModel.findByIdAndUpdate({_id: userId},{$set: {isDeleted: true}})
        return res.status(200).send({status: true, msg: "deleted successfully"})
    } catch (error) {
        return res.status(500).send({status: false, err: error.message })
    }
}


module.exports = {createuser, userlogin, getUserList, userById, UpdateUserById, deleteUserById}