const mongoose = require("mongoose");

const flaggedDeviceSchema = new mongoose.Schema(
  {
    ip_address: {
      type: String,
      required: true,
    },
    mac_address: {
      type: String,
      required: true,
    },
    device_name: {
      type: String,
      default: "Unknown",
    },
    suspicious_score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    reason_flagged: {
      type: String,
      required: true,
    },
    timestamp_flagged: {
      type: Date,
      default: Date.now,
    },
    last_seen: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["flagged", "under_review", "blocked", "safe"],
      default: "flagged",
    },
    network_id: {
      type: String,
      default: "UnknownNetwork",
    },
    actions_taken: {
      type: String,
      default: "None",
    },
  },
  { collection: "flagged_devices" }
);

// Optional: Add a compound index for IP + MAC to avoid duplicates
flaggedDeviceSchema.index({ ip_address: 1, mac_address: 1 }, { unique: true });

module.exports = mongoose.model("FlaggedDevice", flaggedDeviceSchema);
