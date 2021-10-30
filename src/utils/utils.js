const crypto = require("crypto")

const sha256 = (str) => crypto.createHash("sha256")
    .update(str)
    .digest("hex");

const isUndefined = (v) => typeof v === "undefined";

const generateRandomPassword = () => sha256((new Date()).toISOString()).slice(0,8)

module.exports = {
    isUndefined,
    generateRandomPassword
}