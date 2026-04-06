const Branch = require("../schemas/branch.schema");
const ApiError = require("../utils/errors/api-error");

const BranchController = {

    findBranches: async function (filter, sort, skip, limit) {
        return await Branch.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Branch.countDocuments(filter);
    },

    findById: async function (id) {
        let branch = await Branch.findById(id);
        if (!branch) throw ApiError.notFound("Cơ sở không tồn tại");
        return branch;
    },

    create: async function (data) {
        let branch = new Branch(data);
        return await branch.save();
    },

    save: async function (branch) {
        return await branch.save();
    },

    deleteById: async function (id) {
        let branch = await Branch.findById(id);
        if (!branch) throw ApiError.notFound("Cơ sở không tồn tại");

        return await Branch.findByIdAndDelete(id);
    }
};

module.exports = BranchController;