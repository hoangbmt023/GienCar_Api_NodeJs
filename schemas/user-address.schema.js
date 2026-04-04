const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
  street: {
    type: String
  },
  ward: {
    type: String
  },
  district: {
    type: String
  },
  city: {
    type: String
  }
});

module.exports = userAddressSchema;
