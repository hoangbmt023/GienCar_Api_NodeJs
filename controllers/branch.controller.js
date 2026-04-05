const Branch = require("../schemas/branch.schema");
const ApiError = require("../untils/errors/api-error");

const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");

const { toBranchResponse, toBranchListResponse } = require("../mappers/branch.mapper");

const BranchController = {

    // GET ALL ACTIVE
    getAllActive: async function (query) {
        const { page, size, skip, sort } = buildPaging(query);

        let [data, total] = await Promise.all([
            Branch.find({ isActive: true }).sort(sort).skip(skip).limit(size),
            Branch.countDocuments({ isActive: true }),
        ]);

        return {
            data: toBranchListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // GET ALL (ADMIN)
    getAll: async function (query) {
        const { page, size, skip, sort } = buildPaging(query);

        let [data, total] = await Promise.all([
            Branch.find().sort(sort).skip(skip).limit(size),
            Branch.countDocuments(),
        ]);

        return {
            data: toBranchListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // GET BY ID
    getById: async function (id) {
        let branch = await Branch.findById(id);
        if (!branch) throw ApiError.notFound("Cơ sở không tồn tại");

        return toBranchResponse(branch);
    },

    // CREATE
    create: async function (body) {
        let { name, address, city, phone, email, mapUrl, isActive } = body;

        let branch = new Branch({
            name,
            address,
            city,
            phone,
            email,
            mapUrl,
            isActive,
        });

        await branch.save();
    },

    // UPDATE
    update: async function (id, body) {
        let branch = await Branch.findById(id);
        if (!branch) throw ApiError.notFound("Cơ sở không tồn tại");

        branch.name = body.name ?? branch.name;
        branch.address = body.address ?? branch.address;
        branch.city = body.city ?? branch.city;
        branch.phone = body.phone ?? branch.phone;
        branch.email = body.email ?? branch.email;
        branch.mapUrl = body.mapUrl ?? branch.mapUrl;
        branch.isActive = body.isActive ?? branch.isActive;

        await branch.save();

        return toBranchResponse(branch);
    },

    // DELETE
    delete: async function (id) {
        let branch = await Branch.findById(id);
        if (!branch) throw ApiError.notFound("Cơ sở không tồn tại");

        await Branch.findByIdAndDelete(id);
    },

    // TOGGLE ACTIVE
    toggleActive: async function (id) {
        let branch = await Branch.findById(id);
        if (!branch) throw ApiError.notFound("Cơ sở không tồn tại");

        branch.isActive = !branch.isActive;

        await branch.save();

        return toBranchResponse(branch);
    },
};

module.exports = BranchController;