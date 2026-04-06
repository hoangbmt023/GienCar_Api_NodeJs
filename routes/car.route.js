var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
});

const mediaUtil = require("../utils/media.util");

const controller = require("../controllers/car.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const slugify = require("slugify");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toCarResponse, toCarListResponse } = require("../mappers/car.mapper");

// relation
const CarSeries = require("../schemas/car-series.schema");


// ================= FILTER =================
router.get("/", async (req, res, next) => {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let filter = {};

        if (req.query.seriesId) filter.seriesId = req.query.seriesId;
        if (req.query.categoryId) filter.categoryId = req.query.categoryId;

        // 🔥 FIX STATUS
        const mapStatus = {
            available: "ACTIVE",
            inactive: "INACTIVE",
        };

        if (req.query.status) {
            filter.status = mapStatus[req.query.status] || req.query.status;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        let [cars, total] = await Promise.all([
            controller.findCars(filter, sort, skip, size),
            controller.count(filter)
        ]);

        if (!cars.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toCarListResponse(cars),
                "Lấy danh sách xe",
                createPagination({ page, size, total })
            )
        );

    } catch (e) {
        next(e);
    }
});


// ================= SEARCH =================
router.get("/search", async (req, res, next) => {
    try {
        let { q } = req.query;
        const { page, size, skip } = buildPaging(req.query);

        if (!q || q.trim() === "") {
            return res.send(resultList.success([], "Không có dữ liệu"));
        }

        let regex = new RegExp(q, "i");

        let [cars, total] = await Promise.all([
            controller.findCars({ name: regex }, {}, skip, size),
            controller.count({ name: regex })
        ]);

        return res.send(
            resultList.success(
                resultList.success(
                    toCarListResponse(cars), // dùng mapper luôn
                    "Tìm kiếm thành công"
                )
            )
        );

    } catch (e) {
        next(e);
    }
});


// ================= GET BY SLUG =================
router.get("/slug/:slug", async (req, res, next) => {
    try {
        let car = await controller.findOne({ slug: req.params.slug });
        if (!car) throw ApiError.notFound("Car không tồn tại");

        return res.send(
            resultDTO.success(toCarResponse(car), "Lấy thành công")
        );

    } catch (e) {
        next(e);
    }
});


// ================= GET BY ID =================
router.get("/:id", async (req, res, next) => {
    try {
        let car = await controller.findById(req.params.id);

        return res.send(
            resultDTO.success(toCarResponse(car), "Lấy thành công")
        );

    } catch (e) {
        next(e);
    }
});


// ================= CREATE =================
router.post("/", upload.array("imageFiles", 10), async (req, res, next) => {
    try {
        const {
            name,
            seriesId,
            categoryId,
            price,
            quantity,
            depositPercentage,
            yearProduce,
            description,
            brandIds,
        } = req.body;

        if (!name || !seriesId || !categoryId) {
            throw ApiError.badRequest("Thiếu name hoặc seriesId hoặc categoryId");
        }

        const series = await CarSeries.findById(seriesId);
        if (!series) throw ApiError.notFound("CarSeries không tồn tại");

        const slug = slugify(name, { lower: true, strict: true });

        const existed = await controller.findOne({ slug });
        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        // upload images
        let images = [];
        if (req.files?.length) {
            const uploaded = await Promise.all(
                req.files.map(file => mediaUtil.upload(file, "cars", "image"))
            );

            images = uploaded.map((url, index) => ({
                imageUrl: url,
                order: index + 1,
                isPrimary: index === 0,
            }));
        }

        // normalize brandIds
        let parsedBrandIds = [];
        if (brandIds) {
            parsedBrandIds = Array.isArray(brandIds) ? brandIds : [brandIds];
        }

        await controller.create({
            name,
            slug,
            seriesId,
            categoryId,
            price: Number(price) || 0,
            quantity: Number(quantity) || 0,
            depositPercentage: Number(depositPercentage) || 0,
            yearProduce: yearProduce ? Number(yearProduce) : null,
            description,
            brandIds: parsedBrandIds,
            status: "ACTIVE",
            images,
            exteriorColors: [],
        });

        return res.send(resultNoData.success("Tạo xe thành công"));

    } catch (e) {
        next(e);
    }
});

// ================= UPDATE =================
router.put("/:id", upload.array("imageFiles", 10), async (req, res, next) => {
    try {
        const car = await controller.findById(req.params.id);

        const {
            name,
            seriesId,
            categoryId,
            price,
            quantity,
            depositPercentage,
            yearProduce,
            description,
            brandIds,
        } = req.body;

        const newName = name || car.name;
        const slug = slugify(newName, { lower: true, strict: true });

        const existed = await controller.findOne({
            slug,
            _id: { $ne: car._id },
        });

        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        // check series
        if (seriesId) {
            const series = await CarSeries.findById(seriesId);
            if (!series) throw ApiError.notFound("CarSeries không tồn tại");
            car.seriesId = seriesId;
        }

        // update category
        if (categoryId) {
            car.categoryId = categoryId;
        }

        // xử lý images
        if (req.files?.length) {
            if (car.images?.length) {
                await Promise.all(
                    car.images.map(img =>
                        mediaUtil.deleteByUrl(img.imageUrl, "image")
                    )
                );
            }

            const uploaded = await Promise.all(
                req.files.map(file => mediaUtil.upload(file, "cars", "image"))
            );

            car.images = uploaded.map((url, index) => ({
                imageUrl: url,
                order: index + 1,
                isPrimary: index === 0,
            }));
        }

        // normalize brandIds
        if (brandIds) {
            car.brandIds = Array.isArray(brandIds) ? brandIds : [brandIds];
        }

        // update fields
        car.name = newName;
        car.slug = slug;
        car.price = price !== undefined ? Number(price) : car.price;
        car.quantity = quantity !== undefined ? Number(quantity) : car.quantity;
        car.depositPercentage =
            depositPercentage !== undefined
                ? Number(depositPercentage)
                : car.depositPercentage;

        car.yearProduce =
            yearProduce !== undefined ? Number(yearProduce) : car.yearProduce;

        car.description = description ?? car.description;


        await controller.save(car);

        return res.send(
            resultDTO.success(toCarResponse(car), "Cập nhật thành công")
        );

    } catch (e) {
        next(e);
    }
});

// ================= DELETE =================
router.delete("/:id", async (req, res, next) => {
    try {
        let car = await controller.findById(req.params.id);

        // delete all images
        if (car.images?.length) {
            await Promise.all(
                car.images.map(img =>
                    mediaUtil.deleteByUrl(img.imageUrl, "image")
                )
            );
        }

        await controller.deleteById(req.params.id);

        return res.send(resultNoData.success("Xóa thành công"));

    } catch (e) {
        next(e);
    }
});

// ================= ADD COLOR =================
router.post("/:id/colors", upload.single("imageFiles"), async (req, res, next) => {
    try {
        const car = await controller.findById(req.params.id);

        const { colorId } = req.body;

        if (!colorId) {
            throw ApiError.badRequest("Thiếu colorId");
        }

        // check duplicate
        const exists = car.exteriorColors?.some(
            c => c.colorId.toString() === colorId
        );

        if (exists) {
            throw ApiError.duplicate("Màu đã tồn tại");
        }

        // validate file
        let imageUrl = null;

        if (req.file) {
            if (!req.file.mimetype.startsWith("image")) {
                throw ApiError.badRequest("Chỉ chấp nhận file ảnh");
            }

            imageUrl = await mediaUtil.upload(
                req.file,
                `cars/${car._id}/colors`,
                "image"
            );
        }

        car.exteriorColors.push({
            colorId,
            imageUrl,
        });

        await controller.save(car);

        return res.send(
            resultDTO.success(toCarResponse(car), "Thêm màu thành công")
        );

    } catch (e) {
        next(e);
    }
});


// ================= REMOVE COLOR =================
router.delete("/:id/colors/:colorId", async (req, res, next) => {
    try {
        const car = await controller.findById(req.params.id);

        const index = car.exteriorColors.findIndex(
            c => c.colorId.toString() === req.params.colorId
        );

        // check trước khi dùng
        if (index === -1) {
            throw ApiError.notFound("Color không tồn tại");
        }

        const removed = car.exteriorColors[index];

        // delete ảnh trên cloud nếu có
        if (removed?.imageUrl) {
            await mediaUtil.deleteByUrl(removed.imageUrl, "image");
        }

        car.exteriorColors.splice(index, 1);

        await controller.save(car);

        return res.send(
            resultDTO.success(toCarResponse(car), "Xóa màu thành công")
        );

    } catch (e) {
        next(e);
    }
});


// ================= MOVE IMAGE =================
router.patch("/:id/images/move", async (req, res, next) => {
    try {
        const { oldIndex, newIndex } = req.query;

        const oldOrder = Number(oldIndex);
        const newOrder = Number(newIndex);

        if (!oldOrder || !newOrder) {
            throw ApiError.badRequest("Thiếu hoặc sai index");
        }

        const car = await controller.findById(req.params.id);

        const oldImg = car.images.find(i => i.order === oldOrder);
        const newImg = car.images.find(i => i.order === newOrder);

        if (!oldImg || !newImg) {
            throw ApiError.badRequest("Index không hợp lệ");
        }

        // swap order
        [oldImg.order, newImg.order] = [newImg.order, oldImg.order];

        await controller.save(car);

        return res.send(resultNoData.success("Move thành công"));

    } catch (e) {
        next(e);
    }
});

module.exports = router;