const ApiError = require("../untils/errors/api-error");

function createOtp(code, ttlSeconds) {
  return {
    code,
    expireAt: new Date(Date.now() + ttlSeconds * 1000),
  };
}

function isExpired(otp) {
  return otp.expireAt < new Date();
}

function isValid(otp, input) {
  return otp.code === input;
}

function verifyOtp(otp, input) {
  if (isExpired(otp)) {
    throw ApiError.badRequest("OTP đã hết hạn");
  }

  if (!isValid(otp, input)) {
    throw ApiError.badRequest("OTP không hợp lệ");
  }
}

module.exports = {
  createOtp,
  verifyOtp,
  isExpired,
  isValid,
};
