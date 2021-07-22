const crypto = require("crypto")


const sha256 = (str) => crypto.createHash("sha256")
    .update(str)
    .digest("hex");

const isUndefined = (v) => typeof v === "undefined"

module.exports = {
    sha256,
    isUndefined
}