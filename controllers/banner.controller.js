const Banner = require("../schemas/banner.schema");
const ApiError = require("../untils/errors/api-error");
const BannerPosition = require("../model/banner/enum/banner-position.enum");

const { toBannerResponse, toBannerListResponse } = require("../mappers/banner.mapper");

const BannerController = {

    // ================================
    // GET ACTIVE BANNERS
    // ================================
    getActiveBanners: async function (query) {
        let { position } = query;

        let now = new Date();

        let filter = {
            isActive: true,
        };

        // validate position
        if (position) {
            if (!Object.values(BannerPosition).includes(position)) {
                throw ApiError.badRequest("Position không hợp lệ");
            }
            filter.position = position;
        }

        // filter theo thời gian
        filter.$and = [
            {
                $or: [{ startDate: null }, { startDate: { $lte: now } }],
            },
            {
                $or: [{ endDate: null }, { endDate: { $gte: now } }],
            },
        ];

        let banners = await Banner.find(filter).sort({ order: 1 });

        return toBannerListResponse(banners);
    },

    // ================================
    // CREATE
    // ================================
    create: async function (body, file) {
        let {
            title,
            description,
            videoUrl,
            ctaText,
            ctaLink,
            position,
            startDate,
            endDate,
        } = body;

        if (!Object.values(BannerPosition).includes(position)) {
            throw ApiError.badRequest("Position không hợp lệ");
        }

        let imageUrl = file ? `/uploads/${file.filename}` : null;

        // auto order theo position
        let maxOrder = await Banner.find({ position })
            .sort({ order: -1 })
            .limit(1);

        let newOrder = maxOrder.length ? maxOrder[0].order + 1 : 1;

        let banner = new Banner({
            title,
            description,
            imageUrl,
            videoUrl,
            ctaText,
            ctaLink,
            position,
            order: newOrder,
            startDate,
            endDate,
        });

        await banner.save();
    },

    // ================================
    // MOVE (reorder)
    // ================================
    move: async function (body) {
        let { bannerId, newIndex } = body;

        let banner = await Banner.findById(bannerId);
        if (!banner) throw ApiError.notFound("Banner không tồn tại");

        let siblings = await Banner.find({ position: banner.position })
            .sort({ order: 1 });

        // remove current
        siblings = siblings.filter(b => b._id.toString() !== bannerId);

        if (newIndex < 1 || newIndex > siblings.length + 1) {
            throw ApiError.badRequest("Vị trí không hợp lệ");
        }

        // insert lại
        siblings.splice(newIndex - 1, 0, banner);

        // re-assign order
        for (let i = 0; i < siblings.length; i++) {
            siblings[i].order = i + 1;
            await siblings[i].save();
        }
    },

    // ================================
    // DELETE
    // ================================
    delete: async function (body) {
        let { id } = body;

        let banner = await Banner.findById(id);
        if (!banner) throw ApiError.notFound("Banner không tồn tại");

        let deletedOrder = banner.order;
        let position = banner.position;

        await Banner.findByIdAndDelete(id);

        // reorder lại
        let affected = await Banner.find({
            position,
            order: { $gt: deletedOrder },
        });

        for (let b of affected) {
            b.order -= 1;
            await b.save();
        }
    },
};

module.exports = BannerController;