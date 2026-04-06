// ================= SUB =================

const toOrderDeposit = (d) => ({
    percentage: d?.percentage,
    amount: d?.amount
});

const toOrderItem = (i) => ({
    carId: i.carId?.toString(),
    carName: i.carName,

    carColor: i.carColor
        ? {
            colorId: i.carColor.colorId?.toString(),
            imageUrls: i.carColor.imageUrl
                ? [i.carColor.imageUrl]
                : []
        }
        : null,

    quantity: i.quantity,
    price: i.price,
    subtotal: i.subtotal,

    deposit: i.deposit ? toOrderDeposit(i.deposit) : null
});

const toOrderBranch = (b) => {
    if (!b || Object.keys(b).length === 0) return null;

    return {
        branchId: b.branchId?.toString(),
        branchName: b.branchName,
        branchAddress: b.branchAddress,
        branchCity: b.branchCity,
        branchPhone: b.branchPhone,
        branchEmail: b.branchEmail,
        branchMapUrl: b.branchMapUrl
    };
};


// ================= MAIN =================

const toOrderResponse = (o) => ({
    id: o._id.toString(),

    orderCode: o.orderCode,

    // 🔥 FIX: tách user giống Java
    userId: o.userId?.toString(),
    userName: o.userName,
    userPhone: o.userPhone,
    userEmail: o.userEmail,
    userAddress: o.userAddress,

    description: o.description,

    deliveryBranch: toOrderBranch(o.deliveryBranch),

    orderItems: (o.orderItems || []).map(toOrderItem),

    totalPrice: o.totalPrice,
    totalDeposit: o.totalDeposit,

    orderDate: o.orderDate,
    status: o.status,

    createdAt: o.createdAt,
    updatedAt: o.updatedAt
});

const toOrderListResponse = (orders) => {
    return orders.map(toOrderResponse);
};

module.exports = {
    toOrderResponse,
    toOrderListResponse
};