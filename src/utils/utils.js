const crypto = require("crypto")


const sha256 = (str) => crypto.createHash("sha256")
    .update(str)
    .digest("hex")


module.exports = { 
    sha256
 }