'use strict';
module.exports = (sequelize, DataTypes) => {
  let settings = sequelize.define('settings', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    comments: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  }, {
    tableName: 'settings',
    timestamp: true,
  });
  return settings;
};
