const Color = require("../schemas/color.schema");
const ApiError = require("../utils/errors/api-error");

const ColorController = {

    findColors: async function (filter, sort, skip, limit) {
        return await Color.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Color.countDocuments(filter);
    },

    findById: async function (id) {
        let color = await Color.findById(id);
        if (!color) throw ApiError.notFound("Color không tồn tại");
        return color;
    },

    findOne: async function (filter) {
        return await Color.findOne(filter);
    },

    create: async function (data) {
        let color = new Color(data);
        return await color.save();
    },

    save: async function (color) {
        return await color.save();
    },

    deleteById: async function (id) {
        let color = await Color.findById(id);
        if (!color) throw ApiError.notFound("Color không tồn tại");

        return await Color.findByIdAndDelete(id);
    }
};

module.exports = ColorController;