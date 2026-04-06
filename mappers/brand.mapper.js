const toBrandResponse = (brand) => ({
    id: brand._id,
    name: brand.name,
    slug: brand.slug,
    country: brand.country,
    logo: brand.logo,
});

const toBrandListResponse = (brands) => brands.map(toBrandResponse);

module.exports = { toBrandResponse, toBrandListResponse };