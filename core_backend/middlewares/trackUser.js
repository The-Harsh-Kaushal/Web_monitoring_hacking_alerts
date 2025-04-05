const UserActivity = require('../modals/Userinfo.js');

const trackUser = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const url = req.originalUrl;

    let activity = await UserActivity.findOne({ ip });

    if (!activity) {
    
      activity = new UserActivity({
        ip,
        urlsVisited: [url],
        totalUrlsVisited: 1,
        firstVisit: new Date(),
        lastVisit: new Date()
      });
    } else {
      if (!activity.urlsVisited.includes(url)) {
        activity.urlsVisited.push(url);
        activity.totalUrlsVisited += 1;
      }
      activity.lastVisit = new Date();
    }

    await activity.save();
    next();
  } catch (err) {
    console.error('User tracking failed:', err.message);
    next(); 
  }
};

module.exports = trackUser;
