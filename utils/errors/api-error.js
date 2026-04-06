const ApiError = {
  badRequest: (msg) => ({ status: 400, message: msg }),
  duplicate: (msg) => ({ status: 409, message: msg }),
  notFound: (msg) => ({ status: 404, message: msg }),
  unauthorized: (msg) => ({ status: 401, message: msg }),
  forbidden: (msg) => ({ status: 403, message: msg }),
};

module.exports = ApiError;
