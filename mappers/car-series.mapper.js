const toCarSeriesResponse = (s) => ({
    id: s._id.toString(),

    brandId: s.brandId,

    name: s.name,
    slug: s.slug,

    description: s.description,

    priceFrom: s.priceFrom,
    orderIndex: s.orderIndex,

    highlight: s.highlight,

    imageUrl: s.imageUrl,
});

const toCarSeriesListResponse = (list) =>
    list.map(toCarSeriesResponse);

module.exports = {
    toCarSeriesResponse,
    toCarSeriesListResponse,
};