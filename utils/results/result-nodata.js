const resultNoData = (success, message) => ({
  success,
  message,
});

const success = (message = "") => resultNoData(true, message);

const fail = (message = "Error") => resultNoData(false, message);

module.exports = {
  success,
  fail,
};
