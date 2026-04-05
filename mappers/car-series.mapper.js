const toCarSeriesResponse = (s) => ({
    id: s._id,
    brandId: s.brandId,
    name: s.name,
    slug: s.slug,
    description: s.description,
    imageUrl: s.imageUrl,
    priceFrom: s.priceFrom,
    orderIndex: s.orderIndex,
    highlight: s.highlight,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
});

const toCarSeriesListResponse = (list) => list.map(toCarSeriesResponse);

module.exports = { toCarSeriesResponse, toCarSeriesListResponse };