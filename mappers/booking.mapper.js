const toBookingResponse = (b) => ({
    id: b._id,
    name: b.name,
    phone: b.phone,
    email: b.email,
    carModelId: b.carModelId,
    bookingDate: b.bookingDate,
    timeSlot: b.timeSlot,
    status: b.status,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
});

module.exports = { toBookingResponse };