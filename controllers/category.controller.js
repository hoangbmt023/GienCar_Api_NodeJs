const Category = require("../schemas/category.schema");
const ApiError = require("../untils/errors/api-error");
const slugify = require("slugify");
const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");
const { toCategoryResponse, toCategoryListResponse } = require("../mappers/category.mapper");

const CategoryController = {
    // GET ALL
    getAll: async function (query) {
        const { page, size, skip, sort } = buildPaging(query);

        let [data, total] = await Promise.all([
            Category.find().sort(sort).skip(skip).limit(size),
            Category.countDocuments(),
        ]);

        return {
            data: toCategoryListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // GET BY ID
    getById: async function (id) {
        let category = await Category.findById(id);
        if (!category) throw ApiError.notFound("Category không tồn tại");
        return toCategoryResponse(category);
    },

    // CREATE
    create: async function (name, description) {
        let slug = slugify(name, { lower: true, strict: true });

        if (await Category.exists({ slug })) {
            throw ApiError.duplicate("Slug '" + slug + "' đã tồn tại");
        }

        let category = new Category({ name, description });
        await category.save();

        return toCategoryResponse(category);
    },

    // UPDATE
    update: async function (id, name, description) {
        let slug = slugify(name, { lower: true, strict: true });

        let exists = await Category.findOne({ slug, _id: { $ne: id } });
        if (exists) throw ApiError.duplicate("Slug '" + slug + "' đã tồn tại");

        let updated = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!updated) throw ApiError.notFound("Category không tồn tại");

        return toCategoryResponse(updated);
    },

    // DELETE
    delete: async function (id) {
        await Category.findByIdAndDelete(id);
    },

    moveMenu: async function (menuId, newIndex) {
        let menu = await Menu.findById(menuId);
        if (!menu) throw ApiError.notFound("Menu không tồn tại");

        let parentId = menu.parentId;

        let siblings = await Menu.find({ parentId }).sort({ orderIndex: 1 });

        // remove current menu
        siblings = siblings.filter(m => String(m._id) !== String(menuId));

        if (newIndex < 1 || newIndex > siblings.length + 1) {
            throw ApiError.badRequest("Vị trí không hợp lệ");
        }

        // insert lại vị trí mới
        siblings.splice(newIndex - 1, 0, menu);

        // re-assign orderIndex
        for (let i = 0; i < siblings.length; i++) {
            siblings[i].orderIndex = i + 1;
            await siblings[i].save();
        }
    },
};

module.exports = CategoryController;