const express = require('express')
const router = express.Router()
const { currentUser, registerUser, loginUser, getUser, changePassword, forgetPassword, resetPassword, deleteUser, getRoles, deleteRole } = require('../controllers/userController');
const validateToken = require('../middleware/validateToken');
const { viewReport } = require('../controllers/uploadReportController');

router.post("/register",registerUser);

router.post("/login",loginUser);
router.get("/getUser",getUser);
router.get("/roles", getRoles);          // Get all unique roles
router.delete("/roles/:roleName", deleteRole); 
router.delete("/getUser/:id",deleteUser);
router.post("/changepassword",changePassword);
router.post("/forgetpassword",forgetPassword);
router.post("/resetpassword",resetPassword);
// Get Token
// router.get("/current",validateToken,currentUser);
router.get("/current",currentUser);
module.exports = router