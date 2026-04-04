const { toUserAdminResponse } = require("../mappers/user.mapper");
let userModel = require("../schemas/user.schema");
const ApiError = require("../untils/errors/api-error");
const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");

const UserController = {
  register: async function (email, password, session) {
    email = email.toLowerCase().trim();
    let user = new userModel({
      email: email,
      password: password,
    });

    if (await isEmailExists(user.email)) {
      throw ApiError.duplicate("Email '" + email + "' đã tồn tại");
    }

    await user.save({ session });
    return user;
  },
  getAllUser: async function (query) {
    const { page, size, skip, sort } = buildPaging(query);
    let filter = {};

    if (query.email) {
      filter.email = { $regex: query.email, $options: "i" };
    }

    if (query.status) {
      filter.status = query.status.toUpperCase();
    }

    if (query.role) {
      filter.roles = query.role.toUpperCase();
    }

    let [data, total] = await Promise.all([
      userModel.find(filter).sort(sort).skip(skip).limit(size),
      userModel.countDocuments(filter),
    ]);

    return {
      data: data.map(toUserAdminResponse),
      pagination: createPagination({ page, size, total }),
    };
  },
};

const isEmailExists = async (email) => {
  return await userModel.exists({ email });
};

module.exports = UserController;
