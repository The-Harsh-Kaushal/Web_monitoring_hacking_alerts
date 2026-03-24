const express = require("express");
const { VerifySession } = require("../Middlewares/authentication/sessioinMid");
const { RestLB } = require("../config/config");
const {
  admin_check,
  aggregate_traffic,
  fetchTrafficMetrics,
  fetchBlockedRequests,
  EWMA_and_Unique_Ip_count,
} = require("../Middlewares/admin/metrics");
const router = express.Router();

router.get(
  "/metrics/traffic",
  VerifySession,
  RestLB(),
  admin_check,
  aggregate_traffic,
  (req, res) => {}
);
router.get(
  "/metrics/report",
  VerifySession,
  RestLB(),
  admin_check,
  fetchTrafficMetrics,
  (req, res) => {
    res.status(200).json(req.metrics);
  }
);
router.get(
  "/metrics/blocked",
  VerifySession,
  RestLB(),
  admin_check,
  fetchBlockedRequests,
  (req, res) => {
    res.json({
      count: req.blockedRequests.length,
      data: req.blockedRequests,
    });
  }
);
router.get(
  "/metrics/EWMAIP",
  VerifySession,
  RestLB(),
  admin_check,
  EWMA_and_Unique_Ip_count
);

module.exports = router;
