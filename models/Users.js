/* jshint indent: 2 */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('Users', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(11),
    },

    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: 'User',
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'User',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    userPictureName: {
      type: DataTypes.STRING(100),
      allowNull:true
    },
    accessToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fbUserId: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [
          ['active', 'inactive'],
        ],
      },
    },

  }, {
    tableName: 'Users',
    timestamps: true,
  });
  user.associate = (models) => {
    models.Users.hasMany(models.sharedCampaigns, {
      foreignKey: 'userId',
    });
    models.Users.hasMany(models.campaigns, {
      foreignKey: 'userId',
    });
  };
  return user;
}
