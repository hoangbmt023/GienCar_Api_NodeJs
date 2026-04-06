const Brand = require("../schemas/brand.schema");
const ApiError = require("../utils/errors/api-error");

const BrandController = {

    findBrands: async function (filter, sort, skip, limit) {
        return await Brand.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Brand.countDocuments(filter);
    },

    findById: async function (id) {
        let brand = await Brand.findById(id);
        if (!brand) throw ApiError.notFound("Brand không tồn tại");
        return brand;
    },

    findOne: async function (filter) {
        return await Brand.findOne(filter);
    },

    create: async function (data) {
        let brand = new Brand(data);
        return await brand.save();
    },

    save: async function (brand) {
        return await brand.save();
    },

    deleteById: async function (id) {
        let brand = await Brand.findById(id);
        if (!brand) throw ApiError.notFound("Brand không tồn tại");

        return await Brand.findByIdAndDelete(id);
    }
};

module.exports = BrandController;