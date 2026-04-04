const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.roles,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      sub: userId,
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "15d",
    },
  );
};


module.exports = {
  generateToken,
  generateRefreshToken,
};
