const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  ip: { type: String, required: true },
  urlsVisited: [{ type: String }], 
  totalUrlsVisited: { type: Number, default: 0 }, 
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
