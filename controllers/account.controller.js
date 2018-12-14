const express = require('express');
require("../config/passport");
const validateFields = require('../validate');
const { authMiddware, sessionMiddleware} = require('../middleware/auth-guard.middleware');
const router = express.Router();
const {
  authenticateUser,
  createUser,
  retriveFbUserDetials,
  retriveUserProfile,
  checkIfUserExists,
  forgotUserPassword,
  resetUserPassword,
  changeUserPassword,
  removeUserPassword,
  logout
} = require('../services/account.service');

const {
  sendCustomizedMail
} = require('../services/common/common.service');

router.post('/login', login);
router.post('/logout', logoutUser);
router.get('/token', checkActiveSession);
router.post('/auth/facebook', authinticateFbUser);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
router.get('/userRole/:userId', getUserRole);
router.post('/getUserDetails', getDetail);

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

async function logoutUser(req, res) {
  try {
    await logout(req.session.id);
    req.session = null;
    res.status(200).json({
      message: "User logout successfully."
    }).end();
  } catch (e) {
    res.boom.unauthorized(e.toString())
  }
}
async function checkActiveSession(req,res) {
  try {
    let token = req.session.token;
    console.log(req.session,'asdsad');
    res.status(200).send(token).end();
  } catch (e) {
    res.boom.unauthorized(e.toString())
  }
}

async function authinticateFbUser(req, res, next) {
  const document = {
    userID: req.body.userId,
    accessToken: req.body.accessToken
  }

  const validation = validateFields.validateRequest(req, res, document);
  if (!validation.success) {
    return res.boom.badRequest(validation.errors);
  }
  try {
    const response = await retriveFbUserDetials(document);
    req.session.userInfo = response.user;
    req.session.token = response.token;
    res.status(200).json(response).end();
  } catch (e) {
    console.log(e, 'asdasd')
    res.boom.badRequest(e.toString())
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
  }
  else if (document.password !== document.confirmationPassowrd) {
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

async function changePassword(req, res) {
  const document = {
    email: req.body.email,
    currentPassword: req.body.currentPassword,
    password: req.body.password,
    confirmationPassowrd: req.body.confirmationPassowrd
  }
  const validation = validateFields.validateRequest(req, res, document);
  if (!validation.success) {
    return res.boom.badRequest(validation.errors);
  }
  else if (document.password !== document.confirmationPassowrd) {
    return res.boom.badRequest('password and confirmation password must be same.');
  }
  try {
    const userExists = await checkIfUserExists(document.email);
    if (!userExists) {
      return res.boom.badRequest('You are not registered with us!');
    }
    const response = await changeUserPassword(document).catch( error => {
      return res.boom.badRequest(error);
    });
    res.status(200).json(response).end();
  } catch (e) {
    console.log(e,'asda')
    res.boom.badImplementation(e.toString())
  }
}


async function registerUser(req, res, next) {
  const required = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin,
  }
  const validation = validateFields.validateRequest(req, res, required);
  if (!validation.success) {
    res.boom.badRequest(validation.errors);
  }
  try {
    const userExists = await checkIfUserExists(required.email);
    if (userExists) {
      return res.boom.badRequest('You are already registered with us!');
    }
    await createUser(required);
    const response = await authenticateUser(req, res, next);
    req.session.userInfo = response;
    req.session.token = response.token;
    res.status(200).json(response).end();
  } catch (e) {
    console.log(e,'dsadsf')
    res.boom.badImplementation(e.toString())
  }
}

function getDetail(req, res) {
  req.getConnection(function (err, connection) {
    var sql = "SELECT * FROM `fbRegister`"
    var query = connection.query(sql, function (err, result) {
      if (err) throw err;
      if (res.statusCode == 200)
        res.json({
          result
        }).end();
      //res.send(result).end;
    });
  })
}

async function getUserRole(req, res, next) {
  const required = {
    userId: req.params.userId
  }
  const validation = validateFields.validateRequest(req, res, required);
  if (!validation.success) {
    res.boom.badRequest(validation.errors);
  }
  try {
    const response = await retriveUserProfile(required.userId);
    res.status(200).json(response).end();
  } catch (e) {
    res.boom.badImplementation(e.toString());
  }
}

module.exports = router;