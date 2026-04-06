const toTimeSlotResponse = (slot) => ({
    id: slot._id,
    timeLabel: slot.timeLabel,
    isActive: slot.isActive,
});

const toTimeSlotListResponse = (list) => list.map(toTimeSlotResponse);

module.exports = { toTimeSlotResponse, toTimeSlotListResponse };