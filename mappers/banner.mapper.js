const toBannerResponse = (banner) => ({
    id: banner._id,
    title: banner.title,
    description: banner.description,
    imageUrl: banner.imageUrl,
    videoUrl: banner.videoUrl,
    ctaText: banner.ctaText,
    ctaLink: banner.ctaLink,
    position: banner.position,
    isActive: banner.isActive,
    order: banner.order,
    startDate: banner.startDate,
    endDate: banner.endDate,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
});

const toBannerListResponse = (list) => list.map(toBannerResponse);

module.exports = { toBannerResponse, toBannerListResponse };