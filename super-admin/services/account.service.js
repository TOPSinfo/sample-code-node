'use strict';
const request = require('request-promise');
const passport = require('passport');
const models = require('../../models');
const jwt = require('jsonwebtoken');
const passwordHash = require('password-hash');
const Sequelize = require('sequelize');
const {
  jwtSecretKey,
  fbAppId,
  fbClientToken
} = require('../../config/server.config.js');
const {
  FB,
  FacebookApiException
} = require('fb');
FB.options({
  version: 'v2.9'
});
const urePostApp = FB.extend({
  appId: fbAppId,
  appSecret: fbClientToken
});

exports.authenticateUser = authenticateUser;
exports.createUser = createUser;
exports.retrieveUserList = retrieveUserList;
exports.retrieveAdminUserList = retrieveAdminUserList;
exports.updateUserStatus = updateUserStatus;
exports.retrieveSetting = retrieveSetting;
exports.saveSetting = saveSetting;
exports.retrieveSetting = retrieveSetting;
exports.saveSetting = saveSetting;


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
            if (user.role !== 'super-admin') {
              reject('authintification failed.');
            } else {
              let userInfo = {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
              }
              const token = jwt.sign(userInfo, jwtSecretKey);
              userInfo.token = token;
              userInfo.userId = user.id;
              resolve(userInfo);
            }
          }
        });
      }

    })(req, res, next);
  })
}


async function createUser(user) {
  const obj = {
    fullName: user.fullName,
    email: user.email,
    password: passwordHash.generate(user.password),
    role: 'super-admin'
  }
  const userInfo = await models.Users.create(obj);
  return userInfo;
}


async function retrieveUserList({
  pageNo = false,
  offset = false,
  filter = false
}) {
  const result = await models.Users.findAll({
    where: {
      role: 'user'
    },
    attributes: {
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("sharedCampaigns.userId")), "sharedCount"],
        [Sequelize.fn('SUM', (Sequelize.fn('COALESCE', (Sequelize.col('sharedCampaigns.points')), 0))), 'totalPoints'],
      ]
    },
    include: [{
      model: models.sharedCampaigns,
      attributes: []
    }],
    group: ['Users.id'],
  });
  return result || [];
}

async function retrieveAdminUserList({
  pageNo = false,
  offset = false,
  filter = false
}) {
  const result = await models.Users.findAll({
    where: {
      role: 'admin',
    },

    attributes: Object.keys(models.Users.attributes).concat([
      [Sequelize.literal('(SELECT COUNT(`campaigns`.`id`) FROM `campaigns` WHERE `userId` = `Users`.`id`)'), 'totalCamapign'],
      [Sequelize.literal('(SELECT COUNT(`campaigns`.`id`) FROM `campaigns` WHERE `userId` = `Users`.`id` AND `status` = "active")'), 'activeCampaign']
    ]),

    include: [{
      model: models.campaigns,
      attributes: []
    }],
    group: ['Users.id'],

  });
  return result || [];
}

async function updateUserStatus({
  userId,
  status
}) {
  const result = await models.Users.update({
    status: status,
  }, {
    where: {
      id: userId
    }
  });
  return result;
}

async function retrieveSetting(name) {
  let query = name ? {
    where: {
      name: name,
    }
  } : {};
  const result = await models.Users.findAll(query);
  return result || [];
}


async function saveSetting({name, value}) {
  let result;
  if(retrieveSetting(name)){
    result = await models.settings.update({
      value: value}, {
      where: {
        name: name,
      }
    });
  }else{
    try {
      const result = await models.settings.create({name: name, value: value});
      result || [];
    } catch(e) {
      return validateFields.catchSequalizeError(e);
    }
  }
  return result;
}

async function retrieveSetting(name) {
  let query = name ? {
    where: {
      name: name,
    }
  } : {};
  const result = await models.settings.find(query);
  return result || [];
}


async function saveSetting({ name, value }) {
  let result;
  let existData = await retrieveSetting(name);
  if (existData && existData.id) {
    result = await models.settings.update({value: value }, {
        where: {
          id: existData.id,
        }});
  } else {
    try {
      result = await models.settings.create({ name: name, value: value });
    } catch (e) {
      return validateFields.catchSequalizeError(e);
    }
  }
  return result;
}
