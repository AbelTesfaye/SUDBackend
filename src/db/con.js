const { Sequelize } = require('sequelize');
const { CONNECTION_STRING } = require('../env/env');

let options = {}

if (CONNECTION_STRING.trim().startsWith('postgres')) {
    options = {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
}

const sequelize = new Sequelize(CONNECTION_STRING, options)

module.exports = { sequelize }