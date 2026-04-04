const { toUserAdminResponse } = require("../mappers/user.mapper");
const bcrypt = require("bcrypt");
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

  findById: async function (id) {
    return await userModel.findById(id);
  },

  findByEmail: async function (email) {
    let user = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw ApiError.badRequest("Tài khoản không tồn tại.");
    }
    return user;
  },

  saveUser: async function (userId, data, session) {
    let user = await userModel.findById(userId).session(session);

    if (!user) {
      throw ApiError.badRequest("Tài khoản không tồn tại.");
    }

    // Update fields
    Object.assign(user, data);

    await user.save({ session });

    return user;
  },

  changePassword: async function (data, newPassword, session) {
    let user = data;
    // Cập nhật password
    user.password = newPassword;

    await user.save({ session });

    return user;
  },
};

const isEmailExists = async (email) => {
  return await userModel.exists({ email });
};
module.exports = UserController;
