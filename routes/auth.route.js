var express = require("express");
const resultNoData = require("../untils/results/result-nodata");
const resultDTO = require("../untils/results/result.dto");
const {
  UserLoginRequestValidator,
} = require("../untils/validators/user/auth.validator");
const validateResult = require("../untils/validators/validate-result");
const AuthController = require("../controllers/auth.controller");
var router = express.Router();

router.post(
  "/login",
  UserLoginRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { email, password } = req.body;
      let login = await AuthController.login(email, password);

      let refresh = await AuthController.createRefreshToken(email);
      let data = {
        accessToken: login,
        refreshToken: refresh,
      };
      res.status(200).send(resultDTO.success(data, "Đăng nhập thành công"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

module.exports = router;
