const path = require('path')
const result = require('dotenv').config({
  path: path.join(__dirname, '../../', '.env')
})

if (result.error) {
  console.error(result.error)
}

module.exports = {
  MYSQL_CONNECTION_STRING: process.env.MYSQL_CONNECTION_STRING || 'mysql://sql4426215:zqH1EsbVeV@sql4.freemysqlhosting.net:3306/sql4426215',
  JWT_SECRET: process.env.JWT_SECRET || '9403a38a83735e346ce7812672b56776171077b306851957b1bbb12a064e61e2',
}