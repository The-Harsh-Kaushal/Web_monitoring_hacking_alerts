const SessionStat = require('../modals/SessionStat.js'); 

async function sessionTracker(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const currentHour = new Date();
  currentHour.setMinutes(0, 0, 0); 
  let stat = await SessionStat.findOne({ hour: currentHour });

  if (!stat) {
    stat = new SessionStat({ hour: currentHour, uniqueUsers: [ip], userCount: 1 });
  } else if (!stat.uniqueUsers.includes(ip)) {
    stat.uniqueUsers.push(ip);
    stat.userCount += 1;
  }

  await stat.save();
  next();
}
module.exports = sessionTracker;
