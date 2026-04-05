const CarSeries = require("../schemas/car-series.schema");
const ApiError = require("../untils/errors/api-error");
const slugify = require("slugify");

const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");

const { toCarSeriesResponse, toCarSeriesListResponse } = require("../mappers/car-series.mapper");

// nếu có brand schema thì import để check tồn tại
const Brand = require("../schemas/brand.schema");

const CarSeriesController = {

    // ================= GET ALL =================
    getAll: async function (query) {
        const { page, size, skip, sort } = buildPaging(query);

        let [data, total] = await Promise.all([
            CarSeries.find().sort(sort).skip(skip).limit(size),
            CarSeries.countDocuments(),
        ]);

        return {
            data: toCarSeriesListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // ================= FILTER =================
    getByFilter: async function (query) {
        const { status, highlight } = query;
        const { page, size, skip, sort } = buildPaging(query);

        let filter = {};

        if (status) filter.status = status;
        if (highlight !== undefined) filter.highlight = highlight;

        let [data, total] = await Promise.all([
            CarSeries.find(filter).sort(sort).skip(skip).limit(size),
            CarSeries.countDocuments(filter),
        ]);

        return {
            data: toCarSeriesListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // ================= GET BY ID =================
    getById: async function (id) {
        let s = await CarSeries.findById(id);
        if (!s) throw ApiError.notFound("CarSeries không tồn tại");

        return toCarSeriesResponse(s);
    },

    // ================= CREATE =================
    create: async function (body, file) {
        let { name, description, brandId, priceFrom, highlight } = body;

        let slug = slugify(name, { lower: true, strict: true });

        if (await CarSeries.exists({ slug })) {
            throw ApiError.duplicate("Slug đã tồn tại");
        }

        // check brand tồn tại
        let brand = await Brand.findById(brandId);
        if (!brand) throw ApiError.notFound("Brand không tồn tại");

        let imageUrl = file ? `/uploads/${file.filename}` : null;

        let max = await CarSeries.find().sort({ orderIndex: -1 }).limit(1);
        let orderIndex = max.length ? max[0].orderIndex + 1 : 1;

        let s = new CarSeries({
            name,
            description,
            brandId,
            imageUrl,
            priceFrom,
            highlight,
            orderIndex,
        });

        await s.save();
    },

    // ================= UPDATE =================
    update: async function (id, body, file) {
        let s = await CarSeries.findById(id);
        if (!s) throw ApiError.notFound("CarSeries không tồn tại");

        let newName = body.name || s.name;
        let slug = slugify(newName, { lower: true, strict: true });

        let exists = await CarSeries.findOne({
            slug,
            _id: { $ne: id },
        });

        if (exists) throw ApiError.duplicate("Slug đã tồn tại");

        // check brand
        if (body.brandId) {
            let brand = await Brand.findById(body.brandId);
            if (!brand) throw ApiError.notFound("Brand không tồn tại");
            s.brandId = body.brandId;
        }

        if (file) {
            s.imageUrl = `/uploads/${file.filename}`;
        }

        // update field
        s.name = newName;
        s.description = body.description ?? s.description;
        s.priceFrom = body.priceFrom ?? s.priceFrom;
        s.highlight = body.highlight ?? s.highlight;

        // move nếu đổi index
        if (body.orderIndex && body.orderIndex !== s.orderIndex) {
            await this.move({ id, newIndex: body.orderIndex });
        }

        await s.save();

        return toCarSeriesResponse(s);
    },

    // ================= MOVE =================
    move: async function (body) {
        let { id, newIndex } = body;

        let s = await CarSeries.findById(id);
        if (!s) throw ApiError.notFound("CarSeries không tồn tại");

        let oldIndex = s.orderIndex;

        let target = await CarSeries.findOne({ orderIndex: newIndex });
        if (!target) throw ApiError.badRequest("Index không hợp lệ");

        s.orderIndex = newIndex;
        target.orderIndex = oldIndex;

        await s.save();
        await target.save();
    },

    // ================= DELETE =================
    delete: async function (id) {
        let s = await CarSeries.findById(id);
        if (!s) throw ApiError.notFound("CarSeries không tồn tại");

        let deletedIndex = s.orderIndex;

        await CarSeries.findByIdAndDelete(id);

        let list = await CarSeries.find();

        for (let item of list) {
            if (item.orderIndex > deletedIndex) {
                item.orderIndex -= 1;
                await item.save();
            }
        }
    },
};

module.exports = CarSeriesController;