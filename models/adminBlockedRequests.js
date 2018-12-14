/* jshint indent: 2 */
'use strict';
module.exports = (sequelize, DataTypes) => {
  let BlockedMessage = sequelize.define('adminBlockedRequests', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    campaignId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'campaigns',
        key: 'id',
      },
    },
    advertiserComment: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    adminApproved: {
      type: DataTypes.ENUM,
      values: ['true', 'false'],
      defaultValue: 'false',
    },
  }, {
    tableName: 'adminBlockedRequests',
  });

  BlockedMessage.associate = (models) => {
    models.adminBlockedRequests.belongsTo(models.campaigns, {
      foreignKey: 'campaignId',
    });
    models.adminBlockedRequests.belongsTo(models.Users, {
      foreignKey: 'userId',
    });
  };
  return BlockedMessage;
};
