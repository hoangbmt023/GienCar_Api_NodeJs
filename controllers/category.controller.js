const Category = require("../schemas/category.schema");
const ApiError = require("../utils/errors/api-error");

const CategoryController = {

    findCategories: async function (filter, sort, skip, limit) {
        return await Category.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Category.countDocuments(filter);
    },

    findById: async function (id) {
        let category = await Category.findById(id);
        if (!category) throw ApiError.notFound("Category không tồn tại");
        return category;
    },

    findOne: async function (filter) {
        return await Category.findOne(filter);
    },

    create: async function (data) {
        let category = new Category(data);
        return await category.save();
    },

    save: async function (category) {
        return await category.save();
    },

    deleteById: async function (id) {
        let category = await Category.findById(id);
        if (!category) throw ApiError.notFound("Category không tồn tại");

        return await Category.findByIdAndDelete(id);
    }
};

module.exports = CategoryController;