const { validationResult } = require("express-validator");
const ErrorResponse = require("../errors/error-response");

const validateResult = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const formattedErrors = {};

    result.array().forEach((err) => {
      // lấy field + message
      formattedErrors[err.path] = err.msg;
    });

    return res.status(400).send(ErrorResponse.validation(formattedErrors));
  }

  next();
};

module.exports = validateResult;
