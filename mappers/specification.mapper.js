const toSpecificationResponse = (s) => ({
    engine: s.engine,
    efficiency: s.efficiency,
    body: s.body,
    consumption: s.consumption,
});

module.exports = { toSpecificationResponse };