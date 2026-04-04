const resultList = (success, message, data, pagination = null) => ({
  success,
  message,
  data,
  pagination,
});

const success = (data, message = "", pagination = null) =>
  resultList(true, message, data, pagination);

const fail = (message = "Error") => resultList(false, message, null, null);

module.exports = {
  success,
  fail,
};
