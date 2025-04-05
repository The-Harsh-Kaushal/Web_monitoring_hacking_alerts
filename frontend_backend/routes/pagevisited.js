const express = require('express');
const router = express.Router();
const Userinfo = require('../modals/Userinfo'); 

router.get('/page-views-per-session', async (req, res) => {
  try {
    const result = await Userinfo.aggregate([
      {
        $project: {
          pageCategory: {
            $switch: {
              branches: [
                { case: { $eq: ["$totalUrlsVisited", 1] }, then: "1 page " },
                { case: { $eq: ["$totalUrlsVisited", 2] }, then: "2 pages " },
                { case: { $eq: ["$totalUrlsVisited", 3] }, then: "3 pages " },
                { case: { $eq: ["$totalUrlsVisited", 4] }, then: "4 pages " },
              ],
              default: "5+ pages "
            }
          }
        }
      },
      {
        $group: {
          _id: "$pageCategory",
          sessions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          pagevisited: "$_id",
          sessions: 1
        }
      },
      {
        $sort: { pagevisited: 1 }
      }
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error fetching page view stats:", error);
    res.status(500).json({ error: "Failed to fetch page view data" });
  }
});

module.exports = router;
