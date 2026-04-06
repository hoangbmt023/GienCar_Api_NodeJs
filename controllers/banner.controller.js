const Banner = require("../schemas/banner.schema");
const ApiError = require("../utils/errors/api-error");

const BannerController = {

    findBanners: async function (filter, sort) {
        return await Banner.find(filter).sort(sort);
    },

    findById: async function (id) {
        let banner = await Banner.findById(id);
        if (!banner) throw ApiError.notFound("Banner không tồn tại");
        return banner;
    },

    findOne: async function (filter) {
        return await Banner.findOne(filter);
    },

    findMaxOrder: async function (position) {
        return await Banner.find({ position })
            .sort({ order: -1 })
            .limit(1);
    },

    findSiblings: async function (position) {
        return await Banner.find({ position }).sort({ order: 1 });
    },

    findAffected: async function (position, deletedOrder) {
        return await Banner.find({
            position,
            order: { $gt: deletedOrder }
        });
    },

    create: async function (data) {
        let banner = new Banner(data);
        return await banner.save();
    },

    save: async function (banner) {
        return await banner.save();
    },

    deleteById: async function (id) {
        let banner = await Banner.findById(id);
        if (!banner) throw ApiError.notFound("Banner không tồn tại");

        return await Banner.findByIdAndDelete(id);
    }
};

module.exports = BannerController;