const toSpecificationResponse = (s) => ({
    id: s._id,
    carId: s.carId,

    engine: s.engine,
    efficiency: s.efficiency,
    body: s.body,
    consumption: s.consumption,

    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
});

module.exports = { toSpecificationResponse };