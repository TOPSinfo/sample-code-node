'use strict';
const request = require('request-promise');
const passport = require('passport');
const models = require('../models');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const { jwtSecretKey, fbAppId, fbClientToken } = require('../config/server.config.js');
const passwordHash = require('password-hash');
const { FB, FacebookApiException } = require('fb');
FB.options({ version: 'v2.9' });
const urePostApp = FB.extend({ appId: fbAppId, appSecret: fbClientToken });

exports.authenticateUser = authenticateUser;
exports.retriveUserProfile = retriveUserProfile;
exports.createUser = createUser;
exports.retriveFbUserDetials = retriveFbUserDetials;
exports.forgotUserPassword = forgotUserPassword;
exports.resetUserPassword = resetUserPassword;
exports.checkIfUserExists = checkIfUserExists;
exports.removeUserPassword = removeUserPassword;
exports.changeUserPassword = changeUserPassword;
exports.logout = logout;

async function authenticateUser(req, res, next) {
	return new Promise((resolve, reject) => {
		passport.authenticate("local", {
			session: false
		}, (err, user, info) => {
			if (err) {
				reject('authintification failed.');
			}
			if (!user) {
				reject(info.message);
			} else {
				req.login(user, {
					session: false
				}, (err) => {
					if (err) {
						reject('authintification failed.');
					} else {
						user = user.toJSON();
						let userInfo = {
							id:user.id,
							fullName: user.fullName,
							email: user.email,
							role: user.role
						};
						const token = jwt.sign({
							id: userInfo.id,
							role: userInfo.role
						}, jwtSecretKey);
						userInfo.token = token;
						userInfo.userId = user.id;
						resolve(userInfo);
					}
				});
			}

		})(req, res, next);
	})
}


async function retriveUserProfile(userId) {
	const user = await models.Users.find({ where: { fbUserId: userId } });
	if (!user) {
		throw 'No user Found';
	}
	return user;
}

async function checkIfUserExists(email) {
	const userExists = await models.Users.find({ where: { email: email } });
	if (userExists) {
		return userExists;
	}
	else
		return false;
}

async function createUser(user,isFbLogin) {
	const obj = {
		fullName: user.fullName,
		email: user.email,
		password: isFbLogin ? passwordHash.generate('test123#489') : passwordHash.generate(user.password),
		role: user.isAdmin ? 'admin' : 'user'
	}
	const userInfo = await models.Users.create(obj);
	return userInfo;
}

async function retriveFbUserDetials(userInfo) {
	const res = await FB.api('me', { fields: ['id, name, about, email, accounts, link'], access_token: userInfo.accessToken });
	if (!res || res.error) {
		throw !res ? 'error occurred' : res.error
		return;
	}
	else {
		const obj = {
			accessToken: userInfo.accessToken,
			fullName: res.name,
			email: res.email,
			fbUserId: res.id
		}
		let user = await checkIfUserExists(res.email);
		if (!user) {
			user = await createUser(obj,true);
		}
		if (user) {
			user = user.toJSON();
			const token = jwt.sign({
							id: user.id,
							role: user.role
						}, jwtSecretKey);
			user.token = token;
			user.userId = user.id;
			return user;
		}
		else
			throw 'user not found.'
	}
}
async function forgotUserPassword(userDetail) {
	const userObject = {
		'email': userDetail.email,
		'userId': userDetail.id,
		'token': userDetail.token
	}
	const doc = await models.changePassword.create(userObject);
	return doc;
}

async function resetUserPassword(userDetail) {
	const isAppliedChangeRequest = await models.changePassword.findOne({ where: { email: userDetail.email, token: userDetail.token } });
	if (isAppliedChangeRequest) {
		const doc = await models.Users.update({ password: passwordHash.generate(userDetail.password) }, { where: { email: userDetail.email } });
		return doc;
	}
	else
		throw 'No change password request found.'

}

async function changeUserPassword(userDetail) {
	if (await checkIfUserAuth(userDetail.email, userDetail.currentPassword)) {
		const doc = await models.Users.update({ password: passwordHash.generate(userDetail.password)}, { where: { email: userDetail.email } });
		return doc;
	}
	else 
		throw 'Current password is incorrect.';
}

async function checkIfUserAuth(email, password) {
	let isExists = await checkIfUserExists(email);
	if (isExists && passwordHash.verify(password, isExists.password)) {
		return true;
	} else {
		return false;
	}
}

async function removeUserPassword(token) {
	const doc = await models.changePassword.destroy({ where: { token: token } });;
	return doc;
}


async function logout(sid) {
	const query = `DELETE FROM Sessions WHERE sid = '${sid}'`;
	let result = await models.sequelize.query(query, {
		type: Sequelize.QueryTypes.DELETE
	});
	return result;
}

async function converToHash() {
	const docs = await models.Users.findAll();
	for(const doc of docs) {
		if (!passwordHash.isHashed(doc['password'])) {
			await models.Users.update({
				password: passwordHash.generate(doc.password)
			}, {
				where: {
					email: doc.email
				}
			});
		}
		
		
	}
	
}
