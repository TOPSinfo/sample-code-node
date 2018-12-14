'use strict'
const models = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op

exports.retrieveUserProfileDetails = retrieveUserProfileDetails;
exports.saveUserDetails = saveUserDetails;
exports.checkDuplicateEmail = checkDuplicateEmail;
exports.retrieveAdminProfileDetails = retrieveAdminProfileDetails;

async function retrieveUserProfileDetails(id) {
    let result = await models.Users.find({where : { id: id }, 
        attributes: {
            include: [
              [Sequelize.fn("COUNT", Sequelize.col("sharedCampaigns.campaignId")), "postsShared"],
              [Sequelize.fn("SUM", Sequelize.col("sharedCampaigns.points")), "pointsEarned"]
            ]
        },
        include: [{
            model: models.sharedCampaigns,
            attributes: []
        }]
    });
    return result || [];
}

async function saveUserDetails(id, objUpdated) {
    let query = {};
    query.where = { id: id };
    const result = await models.Users.update(objUpdated, query);
    return result || [];
}

async function checkDuplicateEmail(email, id) {
    let query = {};
    query.where = { email: email,
        id :{
            [Op.ne] : id }
        };
    let result = await models.Users.find(query);
    return result || false;
}

async function retrieveAdminProfileDetails(id) {
    let result = await models.Users.find({where : { id: id },
        attributes: {
            include: [
              [Sequelize.fn("COUNT", Sequelize.col("campaigns.id")), "totalCampaigns"],
              [models.sequelize.literal('(SELECT count(DISTINCT sharedCampaigns.campaignId) FROM `sharedCampaigns` WHERE `sharedCampaigns`.`userId` = `Users`.`id`)'),"totalSharedCampaigns"
              ]
            ]
        },
        include: [{
            model: models.campaigns
        }
        ]
    });
    return result || [];
}