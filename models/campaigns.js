/* jshint indent: 2 */
'use strict';
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
module.exports = (sequelize, DataTypes) => {
  const coupon = sequelize.define('campaigns', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    urlId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: shortid.generate(),
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    shareUrl: {
      type: DataTypes.STRING(200),
      allowNull: false,
      set(val) {
        const urlId = shortid.generate();
        const slug = this.getDataValue('slug');
        const url = `campaign/${slug}-${urlId}`;
        // 'this' allows you to access attributes of the instance
        this.setDataValue('urlId', urlId);
        this.setDataValue('shareUrl', url);
      },
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    allocatedPoints: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    maxAllowShare: {
      type: DataTypes.INTEGER(200),
      allowNull: false,
      validate: {
        isNumeric: true,
        min: 1,
      },
    },
    adminShared: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    shareOnPlatform: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return this.getDataValue('shareOnPlatform') ? this.getDataValue('shareOnPlatform').split(',') : this.getDataValue('shareOnPlatform');
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      validate: {
        isIn: [
          ['active', 'inactive'],
        ],
      },
    },
    comment: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    isAdminBlocked: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
    },
    adminBlockedReason: {
      type: DataTypes.STRING(225),
      allowNull: true,
    },
    readBy: {
      type: DataTypes.ENUM,
      values: ['true', 'false'],
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull:false
    },
  }, {
    tableName: 'campaigns',
    // setterMethods: {
    //   shareUrl: (value) => {
    //     const urlId = shortid.generate();
    //     const url = this.getDataValue('urlId') && this.getDataValue('name') ? `campaign/${this.getDataValue('name')}-${urlId}` : 'www.urepost.com';
    //     this.setDataValue('shareUrl', url);
    //     this.setDataValue('urlId', urlId);
    //   },
    // },
  });
  coupon.associate = (models) => {
    models.campaigns.hasMany(models.sharedCampaigns, {
      foreignKey: 'campaignId',
    });
    models.campaigns.belongsTo(models.Users, {
      foreignKey: 'userId',
    });
  };
  return coupon;
};
