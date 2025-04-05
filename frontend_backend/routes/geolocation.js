const express = require('express');
const router = express.Router();
const GeoLocation = require('../modals/GeoLocation');

router.get('/geo-location-stats', async (req, res) => {
  try {
    const locations = await GeoLocation.find({}, {
      _id: 0,
      country: 1,
      visitors: 1,
      lat: 1,
      lng: 1
    });

    res.json(locations);
  } catch (error) {
    console.error("Error fetching geo-location data:", error);
    res.status(500).json({ error: "Failed to fetch geo-location data" });
  }
});

module.exports = router;
