const { Sequelize } = require('sequelize');
const { MYSQL_CONNECTION_STRING } = require('../env/env');
const sequelize = new Sequelize(MYSQL_CONNECTION_STRING)

module.exports = { sequelize }