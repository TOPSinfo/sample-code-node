'use strict';
module.exports = (sequelize, DataTypes) => {
  let cmsPages = sequelize.define('cmsPages', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    pageName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.BLOB(),
      allowNull: false,
      get() {
        return this.getDataValue('content').toString('utf8'); // or whatever encoding is right
      },
    },
  }, {
    tableName: 'cmsPages',
    timestamp: true,
  });
  return cmsPages;
};