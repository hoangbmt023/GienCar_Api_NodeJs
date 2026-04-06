var express = require("express");
var router = express.Router();

const branchController = require("../controllers/branch.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const {
    toBranchResponse,
    toBranchListResponse,
} = require("../mappers/branch.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

const {
    CreateBranchRequestValidator,
    UpdateBranchRequestValidator,
} = require("../utils/validators/branch.validator");

const validateResult = require("../utils/validators/validate-result");

// ================= GET ALL ACTIVE =================
router.get("/", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [branches, total] = await Promise.all([
            branchController.findBranches({ isActive: true }, sort, skip, size),
            branchController.count({ isActive: true }),
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
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

// ================= GET ALL ADMIN =================
router.get("/admin", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [branches, total] = await Promise.all([
            branchController.findBranches({}, sort, skip, size),
            branchController.count({}),
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
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

// ================= GET BY ID =================
router.get("/:id", async function (req, res, next) {
    try {
        let branch = await branchController.findById(req.params.id);

        return res.send(
            resultDTO.success(
                toBranchResponse(branch),
                "Lấy chi tiết cơ sở thành công"
            )
        );
    } catch (error) {
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

// ================= CREATE =================
router.post(
    "/",
    CheckLogin,
    CheckRole("ADMIN"),
    CreateBranchRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const {
                name,
                address,
                city,
                phone,
                email,
                mapUrl,
                isActive,
            } = req.body;

            await branchController.create({
                name,
                address,
                city,
                phone,
                email,
                mapUrl,
                isActive,
            });

            return res.send(resultNoData.success("Tạo cơ sở thành công"));
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= UPDATE =================
router.put(
    "/:id",
    CheckLogin,
    CheckRole("ADMIN"),
    UpdateBranchRequestValidator,
    validateResult,
    async function (req, res, next) {
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
                resultDTO.success(
                    toBranchResponse(branch),
                    "Cập nhật cơ sở thành công"
                )
            );
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= DELETE =================
router.delete(
    "/:id",
    CheckLogin,
    CheckRole("ADMIN"),
    async function (req, res, next) {
        try {
            await branchController.deleteById(req.params.id);

            return res.send(resultNoData.success("Xóa cơ sở thành công"));
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= TOGGLE ACTIVE =================
router.patch("/:id/toggle", async function (req, res, next) {
    try {
        let branch = await branchController.findById(req.params.id);

        branch.isActive = !branch.isActive;

        await branchController.save(branch);

        return res.send(
            resultDTO.success(
                toBranchResponse(branch),
                "Cập nhật trạng thái thành công"
            )
        );
    } catch (error) {
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

module.exports = router;