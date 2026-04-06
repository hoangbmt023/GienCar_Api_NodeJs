var express = require("express");
var router = express.Router();

const branchController = require("../controllers/branch.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toBranchResponse, toBranchListResponse } = require("../mappers/branch.mapper");


// ================= GET ALL ACTIVE =================
router.get("/", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [branches, total] = await Promise.all([
            branchController.findBranches({ isActive: true }, sort, skip, size),
            branchController.count({ isActive: true })
        ]);

        if (!branches.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toBranchListResponse(branches),
                "Lấy danh sách cơ sở hoạt động thành công",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= GET ALL ADMIN =================
router.get("/admin", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [branches, total] = await Promise.all([
            branchController.findBranches({}, sort, skip, size),
            branchController.count({})
        ]);

        if (!branches.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toBranchListResponse(branches),
                "Lấy toàn bộ cơ sở thành công",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= GET BY ID =================
router.get("/:id", async function (req, res, next) {
    try {
        let branch = await branchController.findById(req.params.id);

        return res.send(
            resultDTO.success(toBranchResponse(branch), "Lấy chi tiết cơ sở thành công")
        );

    } catch (error) {
        next(error);
    }
});


// ================= CREATE =================
router.post("/", async function (req, res, next) {
    try {
        let { name, address, city } = req.body;

        if (!name || !address || !city) {
            throw ApiError.badRequest("Thiếu thông tin bắt buộc");
        }

        await branchController.create({
            name,
            address,
            city,
            phone: req.body.phone,
            email: req.body.email,
            mapUrl: req.body.mapUrl,
            isActive: req.body.isActive ?? true
        });

        return res.send(resultNoData.success("Tạo cơ sở thành công"));

    } catch (error) {
        next(error);
    }
});


// ================= UPDATE =================
router.put("/:id", async function (req, res, next) {
    try {
        let branch = await branchController.findById(req.params.id);

        branch.name = req.body.name ?? branch.name;
        branch.address = req.body.address ?? branch.address;
        branch.city = req.body.city ?? branch.city;
        branch.phone = req.body.phone ?? branch.phone;
        branch.email = req.body.email ?? branch.email;
        branch.mapUrl = req.body.mapUrl ?? branch.mapUrl;
        branch.isActive = req.body.isActive ?? branch.isActive;

        await branchController.save(branch);

        return res.send(
            resultDTO.success(toBranchResponse(branch), "Cập nhật cơ sở thành công")
        );

    } catch (error) {
        next(error);
    }
});


// ================= DELETE =================
router.delete("/:id", async function (req, res, next) {
    try {
        await branchController.deleteById(req.params.id);

        return res.send(resultNoData.success("Xóa cơ sở thành công"));

    } catch (error) {
        next(error);
    }
});


// ================= TOGGLE ACTIVE =================
router.patch("/:id/toggle", async function (req, res, next) {
    try {
        let branch = await branchController.findById(req.params.id);

        branch.isActive = !branch.isActive;

        await branchController.save(branch);

        return res.send(
            resultDTO.success(toBranchResponse(branch), "Cập nhật trạng thái thành công")
        );

    } catch (error) {
        next(error);
    }
});


module.exports = router;