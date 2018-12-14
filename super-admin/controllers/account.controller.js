const express = require('express');
require("../../config/passport");
const validateFields = require('../../validate');
const {
    authMiddware,
    verifyForSuperAdmin
} = require('../../middleware/auth-guard.middleware');
const router = express.Router();
const {
    authenticateUser,
    retrieveUserList,
    updateUserStatus,
    retrieveAdminUserList,
    retrieveSetting,
    saveSetting,
} = require('../services/account.service');
const {
    checkIfUserExists,
    forgotUserPassword,
    resetUserPassword,
    removeUserPassword
} = require('../../services/account.service');
const {
    sendCustomizedMail
} = require('../../services/common/common.service');

router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', [authMiddware, verifyForSuperAdmin], getUsers);
router.put('/user/:userId/:status', [authMiddware, verifyForSuperAdmin], changeUserStatus);
router.get('/setting/:name', [authMiddware, verifyForSuperAdmin], getSettingUser);
router.put('/setting/:name', [authMiddware, verifyForSuperAdmin], saveSettingUser);

async function login(req, res, next) {
    const required = {
        email: req.body.email,
        password: req.body.password
    }
    const validation = validateFields.validateRequest(req, res, required);
    if (!validation.success) {
        return res.boom.badRequest(validation.errors);
    }

    try {
        const response = await authenticateUser(req, res, next);
        req.session.userInfo = response;
        req.session.token = response.token;
        res.status(200).json(response).end();
    } catch (e) {
        res.boom.unauthorized(e.toString())
    }
}

async function logout(req, res) {
    try {
        await req.session.destroy();
        res.status(200).json({
            message: "User logout successfully."
        }).end();
    } catch (e) {
        res.boom.unauthorized(e.toString())
    }
}

async function forgotPassword(req, res) {
    const document = {
        email: req.body.email
    };

    const validation = validateFields.validateRequest(req, res, document);
    if (!validation.success) {
        return res.boom.badRequest(validation.errors);
    }

    try {
        const userExists = await checkIfUserExists(document.email);
        if (!userExists) {
            return res.boom.badRequest('You are not registered with us!');
        }
        const userInfo = {
            email: document.email,
            id: userExists.id
        }
        const mailInfo = {
            'email': document.email,
            'reqHost': 'urepost.com',
            'mailSendTo': document.email,
            'id': userInfo.id
        }
        const templateInfo = {
            'firstName': userExists['firstName']
        }
        const mailResponse = await sendCustomizedMail('NOTIFICATION_MAIL', templateInfo, mailInfo);
        if (mailResponse.success) {
            userInfo['token'] = mailResponse['data']['generatedEmailVerifyToken'];
            await forgotUserPassword(userInfo);
            res.status(200).json({
                message: "sent mail successfully."
            }).end();
        }
    } catch (e) {
        console.log(e, 'sdfsdf');
        res.boom.badImplementation(e.toString())
    }
}

async function resetPassword(req, res) {
    const document = {
        email: req.body.email,
        token: req.body.token,
        password: req.body.password,
        confirmationPassowrd: req.body.confirmationPassowrd
    }
    const validation = validateFields.validateRequest(req, res, document);
    if (!validation.success) {
        return res.boom.badRequest(validation.errors);
    } else if (document.password !== document.confirmationPassowrd) {
        return res.boom.badRequest('password and confirmation password must be same.');
    }
    try {
        const userExists = await checkIfUserExists(document.email);
        if (!userExists) {
            return res.boom.badRequest('You are not registered with us!');
        }
        const response = await resetUserPassword(document);
        await removeUserPassword(document.token);
        res.status(200).json(response).end();
    } catch (e) {
        res.boom.badImplementation(e.toString())
    }
}


async function getUsers(req, res) {
    try {
        const response = String(req.query.admin || 'false') === 'true' ? await retrieveAdminUserList({}) :
            await retrieveUserList({})
        res.status(200).json(response).end();
    } catch (e) {
        console.log(e, 'asasda')
        res.boom.badImplementation(e.toString());
    }
}


async function changeUserStatus(req, res) {
    const document = {
        userId: req.params.userId,
        status: req.params.status,
    }
    const validation = validateFields.validateRequest(req, res, document);
    if (!validation.success) {
        res.boom.badRequest(validation.errors);
    }
    try {
        await updateUserStatus(document);
        res.status(200).json({
            message: "User updated successfully."
        }).end();
    } catch (e) {
        console.log(e, 'dsfsd')
        res.boom.badImplementation(e.toString())
    }
}

async function getSettingUser(req, res) {
    try {
        let name = req.params.name ? req.params.name : false;
        let response =  await retrieveSetting(name)
        res.status(200).json(response).end();
    } catch (e) {
        res.boom.badImplementation(e.toString());
    }
}

async function saveSettingUser(req, res) {
    try {
        const required = {
            value: req.body.value,
            name: req.params.name
        }
        
        const validation = validateFields.validateRequest(req, res, required);
        if (!validation.success) {
            return res.boom.badRequest(validation.errors);
        }
        console.log(required);
        let response =  await saveSetting(required);
        res.status(200).json(response).end();
    } catch (e) {
        res.boom.badImplementation(e.toString());
    }
}

module.exports = router;