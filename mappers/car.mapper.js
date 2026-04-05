const toCarResponse = (car) => ({
    id: car._id,
    name: car.name,
    slug: car.slug,
    quantity: car.quantity,

    brandIds: car.brandIds,

    categoryId: car.categoryId,
    seriesId: car.seriesId,

    price: car.price,
    depositPercentage: car.depositPercentage,
    yearProduce: car.yearProduce,

    images: car.images?.map(i => ({
        imageUrl: i.imageUrl,
        isPrimary: i.isPrimary,
        order: i.order,
    })),

    exteriorColors: car.exteriorColors?.map(c => ({
        colorId: c.colorId,
        imageUrl: c.imageUrl,
    })),

    description: car.description,

    status: car.status,

    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
});

const toCarListResponse = (list) => list.map(toCarResponse);

module.exports = { toCarResponse, toCarListResponse };