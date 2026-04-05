const Color = require("../schemas/color.schema");
const ApiError = require("../untils/errors/api-error");
const slugify = require("slugify");
const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");
const { toColorResponse, toColorListResponse } = require("../mappers/color.mapper");

const ColorController = {

    // GET ALL
    getAll: async function (query) {
        const { page, size, skip, sort } = buildPaging(query);

        let [data, total] = await Promise.all([
            Color.find().sort(sort).skip(skip).limit(size),
            Color.countDocuments(),
        ]);

        return {
            data: toColorListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // GET BY ID
    getById: async function (id) {
        let color = await Color.findById(id);
        if (!color) throw ApiError.notFound("Color không tồn tại");

        return toColorResponse(color);
    },

    // GET BY SLUG
    getBySlug: async function (slug) {
        let color = await Color.findOne({ slug });
        if (!color) throw ApiError.notFound("Color không tồn tại");

        return toColorResponse(color);
    },

    // CREATE
    create: async function (body, file) {
        let { name, description } = body;

        let slug = slugify(name, { lower: true, strict: true });

        if (await Color.exists({ slug })) {
            throw ApiError.duplicate("Slug đã tồn tại");
        }

        let imageUrl = file ? `/uploads/${file.filename}` : null;

        let color = new Color({
            name,
            description,
            imageUrl,
        });

        await color.save();
    },

    // UPDATE
    update: async function (id, body, file) {
        let color = await Color.findById(id);
        if (!color) throw ApiError.notFound("Color không tồn tại");

        let newName = body.name || color.name;
        let slug = slugify(newName, { lower: true, strict: true });

        let exists = await Color.findOne({
            slug,
            _id: { $ne: id },
        });

        if (exists) throw ApiError.duplicate("Slug đã tồn tại");

        // update image
        if (file) {
            color.imageUrl = `/uploads/${file.filename}`;
        }

        color.name = newName;
        color.description = body.description ?? color.description;

        await color.save();

        return toColorResponse(color);
    },

    // DELETE
    delete: async function (id) {
        let color = await Color.findById(id);
        if (!color) throw ApiError.notFound("Color không tồn tại");

        await Color.findByIdAndDelete(id);
    },
};

module.exports = ColorController;