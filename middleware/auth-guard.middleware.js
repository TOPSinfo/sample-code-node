const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
    jwtSecretKey,
} = require('../config/server.config.js');
const authMiddware = passport.authenticate('jwt', { session: false });

async function sessionMiddleware(req, res, next) {
    if (!req.session.userInfo) {
        res.boom.unauthorized("Session is timeout.Please login")
    }
    else {
        next();
    }
}

async function verifyForSuperAdmin(req, res, next) {
    const token = req.get('authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, jwtSecretKey);
    if (!decoded || decoded.role !== 'super-admin') {
        res.boom.unauthorized()
    } else {
        next();
    }
}

async function verifyForAdvertiser(req, res, next) {
     if (!req.session.userInfo || req.session.userInfo.role !== 'admin') {
        res.boom.unauthorized()
    } else {
        next();
    }
}

async function verifyForUser(req, res, next) {
    if (!req.session.userInfo || req.session.userInfo.role !== 'user') {
        res.boom.unauthorized()
    } else {
        next();
    }
}

exports.authMiddware = authMiddware;
exports.sessionMiddleware = sessionMiddleware;
exports.verifyForSuperAdmin = verifyForSuperAdmin;
exports.verifyForAdvertiser = verifyForAdvertiser;
exports.verifyForUser = verifyForUser;