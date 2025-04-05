const express = require('express');
const router = express.Router();
const UserActivity = require('../modals/Userinfo'); 

router.get('/session-duration-stats', async (req, res) => {
  try {
    const result = await UserActivity.aggregate([
      {
        $project: {
          durationInMinutes: {
            $divide: [
              { $subtract: ["$lastVisit", "$firstVisit"] },
              1000 * 60 // Convert ms to minutes
            ]
          }
        }
      },
      {
        $project: {
          durationCategory: {
            $switch: {
              branches: [
                { case: { $lt: ["$durationInMinutes", 1] }, then: "< 1 min" },
                { case: { $and: [ { $gte: ["$durationInMinutes", 1] }, { $lt: ["$durationInMinutes", 3] } ] }, then: "1-3 min" },
                { case: { $and: [ { $gte: ["$durationInMinutes", 3] }, { $lt: ["$durationInMinutes", 5] } ] }, then: "3-5 min" },
                { case: { $and: [ { $gte: ["$durationInMinutes", 5] }, { $lt: ["$durationInMinutes", 10] } ] }, then: "5-10 min" }
              ],
              default: "10+ min"
            }
          }
        }
      },
      {
        $group: {
          _id: "$durationCategory",
          sessions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          duration: "$_id",
          sessions: 1
        }
      },
      {
        $sort: { duration: 1 }
      }
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error fetching session duration stats:", error);
    res.status(500).json({ error: "Failed to fetch session duration data" });
  }
});

module.exports = router;
