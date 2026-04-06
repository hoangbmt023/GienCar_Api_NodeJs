const result = (success, message, data) => ({
  success,
  message,
  data,
});

const success = (data, message = "") => result(true, message, data);

const fail = (message = "Error") => result(false, message, null);

module.exports = {
  success,
  fail,
};
