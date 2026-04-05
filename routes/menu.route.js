var express = require("express");
var router = express.Router();

const menuController = require("../controllers/menu.controller");
const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const ApiError = require("../untils/errors/api-error");
const slugify = require("slugify");
const { toMenuResponse } = require("../mappers/menu.mapper");

// ================= GET =================
router.get("/", async function (req, res) {
    try {
        let { type, locale } = req.query;

        let menus = await menuController.findMenus({
            type: type?.toUpperCase(),
            locale: locale?.toUpperCase(),
        });

        if (!menus.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        const buildTree = (parentId = null) => {
            return menus
                .filter(m => String(m.parentId) === String(parentId))
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map(m => toMenuResponse(m, buildTree(m._id)));
        };

        return res.send(resultList.success(buildTree(null), "Lấy menu thành công"));

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= CREATE =================
router.post("/", async function (req, res) {
    try {
        let { name, isActive, locale, type, url, target, parentId } = req.body;

        if (!locale?.length || !type?.length) {
            throw ApiError.badRequest("Thiếu locale hoặc type");
        }

        let slug = slugify(name, { lower: true, strict: true });

        let existed = await menuController.findOne({
            parentId: parentId || null,
            slug,
            type: type[0],
            locale: locale[0],
        });

        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        if (parentId) {
            let parent = await menuController.findById(parentId);
            if (!parent) throw ApiError.notFound("Parent không tồn tại");

            if (
                parent.type[0] !== type[0] ||
                parent.locale[0] !== locale[0]
            ) {
                throw ApiError.badRequest("Parent không hợp lệ");
            }
        }

        let max = await menuController.findMaxOrder(parentId);
        let orderIndex = max.length ? max[0].orderIndex + 1 : 1;

        await menuController.create({
            name,
            isActive,
            locale,
            type,
            url,
            target,
            parentId,
            orderIndex,
        });

        return res.send(resultNoData.success("Tạo menu thành công"));

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= DELETE =================
router.delete("/", async function (req, res) {
    try {
        let { id } = req.body;

        let menu = await menuController.findById(id);
        if (!menu) throw ApiError.notFound("Menu không tồn tại");

        let children = await menuController.findChildren(id);
        if (children.length) throw ApiError.badRequest("Menu có con");

        let deletedIndex = menu.orderIndex;
        let parentId = menu.parentId;

        await menuController.deleteById(id);

        let affected = await menuController.findAffected(parentId, deletedIndex);

        for (let m of affected) {
            m.orderIndex -= 1;
            await menuController.save(m);
        }

        return res.send(resultNoData.success("Xóa menu thành công"));

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= MOVE =================
router.patch("/move", async function (req, res) {
    try {
        let { menuId, newIndex } = req.body;

        let menu = await menuController.findById(menuId);
        if (!menu) throw ApiError.notFound("Menu không tồn tại");

        let parentId = menu.parentId;

        let siblings = await menuController.findMenus({ parentId });
        siblings = siblings.sort((a, b) => a.orderIndex - b.orderIndex);

        siblings = siblings.filter(m => String(m._id) !== String(menuId));

        if (newIndex < 1 || newIndex > siblings.length + 1) {
            throw ApiError.badRequest("Vị trí không hợp lệ");
        }

        siblings.splice(newIndex - 1, 0, menu);

        for (let i = 0; i < siblings.length; i++) {
            siblings[i].orderIndex = i + 1;
            await menuController.save(siblings[i]);
        }

        return res.send(resultNoData.success("Đã di chuyển menu thành công"));

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

module.exports = router;