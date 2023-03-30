const express = require("express");
const router = express.Router()
const {auth} = require("../middelwares/auth")
const {createuser, userlogin, getUserList, userById, UpdateUserById, deleteUserById} = require("../controllers/userController")


router.post('/users', createuser)
router.post('/login', userlogin)
router.get('/users', getUserList)
router.get('/users/:Id',auth, userById)
router.put('/users/:Id',auth, UpdateUserById)
router.delete('/users/:Id',auth, deleteUserById)


module.exports = router