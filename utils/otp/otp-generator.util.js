const crypto = require("crypto");

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateOtp(length = 6) {
  let otp = "";

  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, CHARACTERS.length);
    otp += CHARACTERS[index];
  }

  return otp;
}

module.exports = {
  generateOtp,
};
