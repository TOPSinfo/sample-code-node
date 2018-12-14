'use strict';
const express = require('express');
const router = express.Router();
const serverConfig = require('../config/server.config');
const { authMiddware, sessionMiddleware} = require('../middleware/auth-guard.middleware');
const validateFields = require('../validate');
const multer = require('multer');
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, serverConfig.imageUploadUrl);
  },
  filename: function (req, file, cb) {
    console.log(file.originalname, 'file')
    const fileExtension = file.originalname.split('.')[1];
    cb(null, "userPic_" + new Date().getTime() + '.' + fileExtension);
  },
  limits: {
    fileSize: serverConfig.maxSizeUpload
  }, //In settings.maxSizeUpload: 1 * 1024 * 1024 // 1MB
})
const addImage = multer({
    storage: imageStorage
});

const { retrieveUserProfileDetails, saveUserDetails, checkDuplicateEmail, retrieveAdminProfileDetails } = require('../services/user.service');
router.get('/social-user', [authMiddware, sessionMiddleware], getUserDetails);
router.put('/social-user', [authMiddware, sessionMiddleware], addImage.single('userPictureName'), updateUserDetails);

module.exports = router;

async function getUserDetails(req, res, next) {
    const userId = req.session.userInfo ? req.session.userInfo.userId : '';
    const role = req.session.userInfo.role;
    try {
        let response =( role == 'admin' ? await retrieveAdminProfileDetails(userId) : await retrieveUserProfileDetails(userId));
        res.status(200).json(response).end();
    } catch (e) {
        res.boom.badImplementation(e.toString());
    }
}

async function updateUserDetails(req, res, next) {
    const userId = req.session.userInfo ? req.session.userInfo.userId : '';
    let document = {
        fullName: req.body.fullName
    };
    let validation = validateFields.validateRequest(req, res, document);
    if (!validation.success) {
        res.boom.badRequest(validation.errors);
    }
    req.file ? document["userPictureName"] = req.file.path.split('static/')[1] : '';
    try {
        // let duplicate = await checkDuplicateEmail(document.email, userId);
        // if(!duplicate){
        let data = await saveUserDetails(userId, document);
        res.status(200).json("Details Successfully Updated.").end();
        // }else{
        //     res.boom.badRequest("This Email id is already exists.Please Choose another one");
        // }
    } catch (e) {
        res.boom.badImplementation(e.toString());
    }
}