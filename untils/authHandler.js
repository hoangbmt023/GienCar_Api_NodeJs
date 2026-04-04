const jwt = require("jsonwebtoken");
const userModel = require("../schemas/user.schema");
const resultNoData = require("./results/result-nodata");
module.exports = {
  CheckLogin: async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send(resultNoData.fail("Chưa đăng nhập"));
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.sub);
      if (!user) {
        return res.status(401).send(resultNoData.fail("User không tồn tại"));
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).send(resultNoData.fail("Token không hợp lệ"));
    }
  },

  CheckRole: function (...requiredRole) {
    return function (req, res, next) {
      const user = req.user;

      if (!user) {
        return res.status(401).send(resultNoData.fail("Chưa đăng nhập"));
      }

      const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];

      const hasRole = requiredRole.some((role) => userRoles.includes(role));

      if (hasRole) {
        return next();
      }

      return res.status(403).send(resultNoData.fail("Không có quyền truy cập"));
    };
  },
};
