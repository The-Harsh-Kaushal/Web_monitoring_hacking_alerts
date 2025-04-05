const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sessionStatSchema = new Schema({
    hour: { type: Date, required: true, unique: true }, 
    uniqueUsers: [String], 
    userCount: { type: Number, default: 0 },
  });
  
  module.exports = mongoose.model('SessionStat', sessionStatSchema);