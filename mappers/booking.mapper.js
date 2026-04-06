const toBookingResponse = (b) => ({
    id: b._id.toString(),
    name: b.name,
    phone: b.phone,
    email: b.email,
    carModelId: b.carModelId?.toString(),

    bookingDate: b.bookingDate
        ? b.bookingDate.toISOString().split("T")[0]
        : null,

    timeSlot: b.timeSlot?.timeLabel || null,

    status: b.status,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
});

module.exports = { toBookingResponse };