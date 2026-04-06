const toCarResponse = (car) => ({
    id: car._id.toString(),

    name: car.name,
    slug: car.slug,
    quantity: car.quantity,

    brandIds: car.brandIds,

    categoryId: car.categoryId,
    seriesId: car.seriesId,

    price: car.price,
    depositPercentage: car.depositPercentage,
    yearProduce: car.yearProduce,

    // 🔥 FIX: map + rename + sort giống Java
    images: (car.images || [])
        .sort((a, b) => a.order - b.order)
        .map(i => ({
            url: i.imageUrl,          // rename
            orderIndex: i.order,      // rename
        })),

    // 🔥 FIX: map lại structure giống Java
    exteriorColors: (car.exteriorColors || []).map(c => ({
        colorId: c.colorId,
        imageUrls: c.imageUrl ? [c.imageUrl] : [], // convert sang array
    })),

    description: car.description,

    status: car.status,

    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
});

const toCarListResponse = (list) => list.map(toCarResponse);

module.exports = { toCarResponse, toCarListResponse };