const Brand = require("../schemas/brand.schema");
const ApiError = require("../untils/errors/api-error");
const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");
const { toBrandResponse, toBrandListResponse } = require("../mappers/brand.mapper");
const slugify = require("slugify");

const BrandController = {

    // GET ALL
    getAll: async function (query) {
        const { page, size, skip, sort } = buildPaging(query);

        let [data, total] = await Promise.all([
            Brand.find().sort(sort).skip(skip).limit(size),
            Brand.countDocuments(),
        ]);

        return {
            data: toBrandListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // CREATE
    create: async function (body, file) {
        let { name, country } = body;

        let slug = slugify(name, { lower: true, strict: true });

        if (await Brand.exists({ slug })) {
            throw ApiError.duplicate("Slug đã tồn tại");
        }

        let logo = file ? `/uploads/${file.filename}` : null;

        let brand = new Brand({
            name,
            country,
            logo,
        });

        await brand.save();

        return toBrandResponse(brand);
    },

    // UPDATE
    update: async function (id, body, file) {
        let { name, country } = body;

        let slug = slugify(name, { lower: true, strict: true });

        let exists = await Brand.findOne({
            slug,
            _id: { $ne: id },
        });

        if (exists) throw ApiError.duplicate("Slug đã tồn tại");

        let brand = await Brand.findById(id);
        if (!brand) throw ApiError.notFound("Brand không tồn tại");

        if (file) {
            brand.logo = `/uploads/${file.filename}`;
        }

        brand.name = name;
        brand.country = country;

        await brand.save();

        return toBrandResponse(brand);
    },

    // DELETE
    delete: async function (id) {
        let brand = await Brand.findById(id);
        if (!brand) throw ApiError.notFound("Brand không tồn tại");

        await Brand.findByIdAndDelete(id);
    },
};

module.exports = BrandController;