const Car = require("../schemas/car.schema");
const ApiError = require("../untils/errors/api-error");
const slugify = require("slugify");

const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");

const { toCarResponse, toCarListResponse } = require("../mappers/car.mapper");

// relation
const CarSeries = require("../schemas/car-series.schema");

// ================= HELPERS =================
function sortImages(images) {
    return images?.sort((a, b) => a.order - b.order);
}

function uploadImages(files) {
    if (!files || files.length === 0) return [];

    return files.map((file, index) => ({
        imageUrl: `/uploads/${file.filename}`,
        order: index + 1,
        isPrimary: index === 0,
    }));
}

// ================= CONTROLLER =================
const CarController = {

    // ================= FILTER =================
    getByFilter: async function (query) {
        const { page, size, skip, sort } = buildPaging(query);

        let {
            seriesId,
            categoryId,
            minPrice,
            maxPrice,
            status
        } = query;

        let filter = {};

        if (seriesId) filter.seriesId = seriesId;
        if (categoryId) filter.categoryId = categoryId;
        if (status) filter.status = status;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let [data, total] = await Promise.all([
            Car.find(filter).sort(sort).skip(skip).limit(size),
            Car.countDocuments(filter),
        ]);

        data = data.map(c => {
            c.images = sortImages(c.images);
            return c;
        });

        return {
            data: toCarListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // ================= SEARCH =================
    search: async function (query) {
        let { q } = query;
        const { page, size, skip } = buildPaging(query);

        if (!q || q.trim() === "") {
            return {
                data: [],
                pagination: createPagination({ page, size, total: 0 }),
            };
        }

        let regex = new RegExp(q, "i");

        let data = await Car.find({ name: regex })
            .skip(skip)
            .limit(size);

        let result = data.map(car => ({
            id: car._id,
            name: car.name,
            slug: car.slug,
            imageUrl: car.images?.sort((a, b) => a.order - b.order)[0]?.imageUrl || null,
        }));

        return {
            data: result,
            pagination: createPagination({ page, size, total: result.length }),
        };
    },

    // ================= GET BY ID =================
    getById: async function (id) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        car.images = sortImages(car.images);

        return toCarResponse(car);
    },

    // ================= GET BY SLUG =================
    getBySlug: async function (slug) {
        let car = await Car.findOne({ slug });
        if (!car) throw ApiError.notFound("Car không tồn tại");

        car.images = sortImages(car.images);

        return toCarResponse(car);
    },

    // ================= CREATE =================
    create: async function (body, files) {
        let {
            name,
            quantity,
            brandIds,
            categoryId,
            price,
            depositPercentage,
            yearProduce,
            seriesId,
            description,
        } = body;

        // validate series
        let series = await CarSeries.findById(seriesId);
        if (!series) throw ApiError.notFound("CarSeries không tồn tại");

        let slug = slugify(name, { lower: true, strict: true });

        if (await Car.exists({ slug })) {
            throw ApiError.duplicate("Slug đã tồn tại");
        }

        let images = uploadImages(files);

        let car = new Car({
            name,
            quantity,
            brandIds,
            categoryId,
            price,
            depositPercentage,
            yearProduce,
            seriesId,
            images,
            exteriorColors: [],
            description,
        });

        await car.save();
    },

    // ================= UPDATE =================
    update: async function (id, body, files) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        let newName = body.name || car.name;
        let slug = slugify(newName, { lower: true, strict: true });

        let exists = await Car.findOne({ slug, _id: { $ne: id } });
        if (exists) throw ApiError.duplicate("Slug đã tồn tại");

        if (body.seriesId) {
            let series = await CarSeries.findById(body.seriesId);
            if (!series) throw ApiError.notFound("CarSeries không tồn tại");
            car.seriesId = body.seriesId;
        }

        // replace images nếu có upload
        if (files && files.length > 0) {
            car.images = uploadImages(files);
        }

        car.name = newName;
        car.quantity = body.quantity ?? car.quantity;
        car.brandIds = body.brandIds ?? car.brandIds;
        car.categoryId = body.categoryId ?? car.categoryId;
        car.price = body.price ?? car.price;
        car.depositPercentage = body.depositPercentage ?? car.depositPercentage;
        car.yearProduce = body.yearProduce ?? car.yearProduce;
        car.description = body.description ?? car.description;

        if (body.status) car.status = body.status;

        await car.save();

        return toCarResponse(car);
    },

    // ================= DELETE =================
    delete: async function (id) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        await Car.findByIdAndDelete(id);
    },

    // ================= ADD COLOR =================
    addExteriorColor: async function (id, body, files) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        let { colorId } = body;

        let exists = car.exteriorColors?.some(c => c.colorId.toString() === colorId);
        if (exists) throw ApiError.duplicate("Màu đã tồn tại");

        let imageUrls = files?.map(f => `/uploads/${f.filename}`) || [];

        car.exteriorColors.push({
            colorId,
            imageUrl: imageUrls[0] || null,
        });

        await car.save();

        return toCarResponse(car);
    },

    // ================= REMOVE COLOR =================
    removeExteriorColor: async function (id, colorId) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        let index = car.exteriorColors.findIndex(c => c.colorId.toString() === colorId);
        if (index === -1) throw ApiError.notFound("Color không tồn tại");

        car.exteriorColors.splice(index, 1);

        await car.save();

        return toCarResponse(car);
    },

    // ================= MOVE IMAGE =================
    moveImage: async function (id, oldIndex, newIndex) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        let oldImg = car.images.find(i => i.order === Number(oldIndex));
        let newImg = car.images.find(i => i.order === Number(newIndex));

        if (!oldImg || !newImg) {
            throw ApiError.badRequest("Index không hợp lệ");
        }

        [oldImg.order, newImg.order] = [newImg.order, oldImg.order];

        await car.save();
    },
};

module.exports = CarController;