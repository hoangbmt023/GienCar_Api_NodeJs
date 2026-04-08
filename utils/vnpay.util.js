const crypto = require("crypto");

const config = {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    url: process.env.VNPAY_URL,
    returnUrl: process.env.VNPAY_RETURN_URL
};

// ================= CREATE PAYMENT URL =================
function createPaymentUrl({ orderId, amount, orderInfo, ip }) {

    if (!config.hashSecret) {
        throw new Error("Missing VNPAY_HASH_SECRET in .env");
    }

    const amountVnp = amount * 100;

    let params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: config.tmnCode,
        vnp_Amount: amountVnp,
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: config.returnUrl,
        vnp_IpAddr: ip,
        vnp_CreateDate: getCurrentDateTime(),
        vnp_ExpireDate: getExpireDateTime(15)
    };

    const sortedParams = sortObject(params);

    const signData = buildQueryString(sortedParams);

    const secureHash = hmacSHA512(config.hashSecret, signData);

    return `${config.url}?${signData}&vnp_SecureHash=${secureHash}`;
}

// ================= VERIFY CALLBACK =================
function verifyCallback(params) {
    const receivedHash = params.vnp_SecureHash;
    if (!receivedHash) return false;

    let filtered = { ...params };
    delete filtered.vnp_SecureHash;
    delete filtered.vnp_SecureHashType;

    const sortedParams = sortObject(filtered);

    // FIX QUAN TRỌNG
    const signData = buildQueryString(sortedParams);

    const calculatedHash = hmacSHA512(
        config.hashSecret,
        signData
    );

    return calculatedHash.toLowerCase() === receivedHash.toLowerCase();
}

// ================= HELPERS =================

// sort key theo alphabet giống TreeMap
function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

// Build query chuẩn vnpay key=value&key2=value2 (QUAN TRỌNG NHẤT)
function buildQueryString(params) {
    return Object.keys(params)
        .map(key => {
            const value = params[key];
            if (value === null || value === undefined || value === "") return "";

            return (
                key +
                "=" +
                encodeURIComponent(value)
                    .replace(/%20/g, "+") // VNPay yêu cầu
            );
        })
        .filter(Boolean)
        .join("&");
}

// HMAC SHA512
function hmacSHA512(key, data) {
    return crypto
        .createHmac("sha512", key)
        .update(data, "utf-8")
        .digest("hex");
}

// yyyyMMddHHmmss
function getCurrentDateTime() {
    return formatDate(new Date());
}

// expire + phút
function getExpireDateTime(minutes) {
    return formatDate(new Date(Date.now() + minutes * 60000));
}

// format date
function formatDate(date) {
    const pad = (n) => n.toString().padStart(2, "0");

    return (
        date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

module.exports = {
    createPaymentUrl,
    verifyCallback
};