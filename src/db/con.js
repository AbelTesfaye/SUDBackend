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

const iLIKE = (colName, lookupValue) => {
    return sequelize.where(sequelize.fn('LOWER', sequelize.col(colName)), 'LIKE', lookupValue.toLowerCase())
}

const iLIKESearch = (colName, lookupValue) => {
    return sequelize.where(sequelize.fn('LOWER', sequelize.col(colName)), 'LIKE', `%${lookupValue.toLowerCase()}%`)
}

module.exports = { sequelize, iLIKE, iLIKESearch }