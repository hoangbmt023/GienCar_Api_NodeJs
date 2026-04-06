const axios = require("axios");

const LocationController = {

    // ===== PROVINCES =====
    getProvinces: async function () {
        try {
            let res = await axios.get("https://provinces.open-api.vn/api/v1/p");
            return res.data;
        } catch (error) {
            throw new Error("Error fetching provinces");
        }
    },

    // ===== DISTRICTS =====
    getDistricts: async function (code) {
        try {
            let res = await axios.get(
                `https://provinces.open-api.vn/api/v1/p/${code}?depth=2`
            );
            return res.data;
        } catch (error) {
            throw new Error("Error fetching districts");
        }
    },

    // ===== WARDS =====
    getWards: async function (code) {
        try {
            let res = await axios.get(
                `https://provinces.open-api.vn/api/v1/d/${code}?depth=2`
            );
            return res.data;
        } catch (error) {
            throw new Error("Error fetching wards");
        }
    },
};

module.exports = LocationController;