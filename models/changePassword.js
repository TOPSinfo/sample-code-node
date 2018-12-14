/* jshint indent: 2 */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChangePassword = sequelize.define('changePasswordRequest', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(11)
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: 'changePasswordRequest',
    timestamps: true,
  });
  ChangePassword.associate = (models) => {
    models.changePasswordRequest.belongsTo(models.Users, {
      foreignKey: 'userId',
    });
  };
  return ChangePassword;
};