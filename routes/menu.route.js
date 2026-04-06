var express = require("express");
var router = express.Router();

const menuController = require("../controllers/menu.controller");
const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const ApiError = require("../utils/errors/api-error");
const slugify = require("slugify");
const { toMenuResponse } = require("../mappers/menu.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

// ================= GET =================
router.get("/", async function (req, res) {
    try {
        const { type, locale } = req.query;

        const menus = await menuController.findMenus({
            type: type?.toUpperCase(),
            locale: locale?.toUpperCase(),
        });

        if (!menus.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        const buildTree = (parentId = null) =>
            menus
                .filter(m => String(m.parentId) === String(parentId))
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map(m => toMenuResponse(m, buildTree(m._id)));

        return res.send(
            resultList.success(buildTree(null), "Lấy menu thành công")
        );
    } catch (error) {
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});


// ================= CREATE =================
router.post("/", CheckLogin, CheckRole("ADMIN"), async function (req, res) {
    try {
        const { name, isActive, locale, type, url, target, parentId } = req.body;

        if (!locale?.length || !type?.length) {
            throw ApiError.badRequest("Thiếu locale hoặc type");
        }

        const slug = slugify(name, { lower: true, strict: true });

        const existed = await menuController.findOne({
            parentId: parentId || null,
            slug,
            type: type[0],
            locale: locale[0],
        });

        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        if (parentId) {
            const parent = await menuController.findById(parentId);

            if (
                parent.type[0] !== type[0] ||
                parent.locale[0] !== locale[0]
            ) {
                throw ApiError.badRequest("Parent không hợp lệ");
            }
        }

        const max = await menuController.findMaxOrder(parentId);
        const orderIndex = max.length ? max[0].orderIndex + 1 : 1;

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
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});


// ================= DELETE =================
router.delete("/", CheckLogin, CheckRole("ADMIN"), async function (req, res) {
    try {
        const { id } = req.body;

        const menu = await menuController.findById(id);

        const children = await menuController.findChildren(id);
        if (children.length) {
            throw ApiError.badRequest("Menu có con");
        }

        const deletedIndex = menu.orderIndex;
        const parentId = menu.parentId;

        await menuController.deleteById(id);

        const affected = await menuController.findAffected(parentId, deletedIndex);

        for (const m of affected) {
            m.orderIndex -= 1;
            await menuController.save(m);
        }

        return res.send(resultNoData.success("Xóa menu thành công"));
    } catch (error) {
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});


// ================= MOVE =================
router.patch("/move", CheckLogin, CheckRole("ADMIN"), async function (req, res) {
    try {
        const { menuId, newIndex } = req.body;

        const menu = await menuController.findById(menuId);
        const parentId = menu.parentId;

        let siblings = await menuController.findMenus({ parentId });

        siblings = siblings
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .filter(m => String(m._id) !== String(menuId));

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
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

module.exports = router;