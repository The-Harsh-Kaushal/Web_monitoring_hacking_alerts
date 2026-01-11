const mongoose = require("mongoose");

const TrafficSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    Total_req: {
      type: Number,
      default: 0,
    },
    subs_gained: {
      type: Number,
      default: 0,
    },

    endpoint_traffic: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

TrafficSchema.index({ date: 1 }, { unique: true });
mongoose.set("autoIndex", false);
module.exports = mongoose.model("Traffic", TrafficSchema);
