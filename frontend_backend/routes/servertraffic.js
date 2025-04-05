const express = require('express');
const router = express.Router();
const SessionStat = require('../modals/SessionStat'); 

router.get('/server-traffic', async (req, res) => {
  try {
    const rawData = await SessionStat.find().sort({ hour: 1 }); // sort by hour if needed
    const trafficData = rawData.map(entry => {
        const hour = new Date(entry.hour).getHours(); 
        return {
          hour,
          requests: entry.requests
        };
      });

    res.json(trafficData);
  } catch (error) {
    console.error("Error fetching server traffic:", error);
    res.status(500).json({ error: "Failed to fetch server traffic data" });
  }
});

module.exports = router;
