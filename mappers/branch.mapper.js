const toBranchResponse = (branch) => ({
    id: branch._id,
    name: branch.name,
    address: branch.address,
    city: branch.city,
    phone: branch.phone,
    email: branch.email,
    mapUrl: branch.mapUrl,
    isActive: branch.isActive,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
});

const toBranchListResponse = (list) => list.map(toBranchResponse);

module.exports = { toBranchResponse, toBranchListResponse };