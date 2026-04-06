const toCategoryResponse = (category) => ({
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
});

const toCategoryListResponse = (categories) => {
    return categories.map(toCategoryResponse);
};

module.exports = { toCategoryResponse, toCategoryListResponse };