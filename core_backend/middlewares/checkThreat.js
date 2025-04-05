const axios = require('axios');
const FlaggedDevice = require('../modals/flaggedDevice.js'); // Adjust the path as necessary

const checkThreat = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.ip;
    const mac = req.headers['x-mac-address']; // You must send MAC in request headers

    if (!ip || !mac) {
      return res.status(400).json({ message: 'Missing IP or MAC address' });
    }

    // Step 1: Check in DB
    const isFlagged = await FlaggedDevice.findOne({ ip_address: ip, mac_address: mac });

    if (isFlagged && ['flagged', 'under_review', 'blocked'].includes(isFlagged.status)) {
      return res.status(403).json({ message: 'Access denied. Device is flagged.' });
    }

    // Step 2: If not flagged, send to ML server
    // const mlResponse = await axios.post('http://<ML_SERVER_IP>:<PORT>/api/evaluate', {
    //   ip_address: ip,
    //   mac_address: mac,
    //   user_agent: req.headers['user-agent'],
    //   method: req.method,
    //   path: req.originalUrl,
    //   timestamp: new Date().toISOString()
    //   // Add more data here if needed
    // });

    // const { suspicious_score, threat_detected, reason } = mlResponse.data;

    // if (threat_detected) {
    if(true){
      // Step 3: Save in DB
      await FlaggedDevice.create({
        ip_address: ip,
        mac_address: mac,
        suspicious_score : 0.95, // Replace with actual score from ML response
        reason_flagged:  'ML flagged as threat',
        status: 'flagged',
        actions_taken: 'Auto-blocked by ML model'
      });

      return res.status(403).json({ message: 'Access denied. ML flagged as threat.' });
    }

    next(); // Safe to proceed

  } catch (err) {
    console.error('Middleware error:', err.message);
    return res.status(500).json({ message: 'Server error in threat detection' });
  }
};

module.exports = checkThreat;
