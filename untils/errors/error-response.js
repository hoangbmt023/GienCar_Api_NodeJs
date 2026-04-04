const message = (msg) => ({
  success: false,
  message: msg,
  errors: null,
});

const validation = (errors) => ({
  success: false,
  message: "Validation failed",
  errors,
});

module.exports = {
  message,
  validation,
};
