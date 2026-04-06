const toColorResponse = (color) => ({
    id: color._id,
    name: color.name,
    slug: color.slug,
    description: color.description,
    imageUrl: color.imageUrl,
});

const toColorListResponse = (list) => list.map(toColorResponse);

module.exports = { toColorResponse, toColorListResponse };