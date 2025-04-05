const GeoLocation = require("../modals/GeoLocation.js");
const axios = require("axios");

const geolocationMiddleware = async (req, res, next) => {
  try {
    const userIp = req.headers["x-forwarded-for"] || req.ip;

    // Check if the IP already exists in any record
    let location = await GeoLocation.findOne({ ips: userIp });

    if (!location) {
      // Get geolocation data from an API
      const { data } = await axios.get(`https://ipapi.co/${userIp}/json/`);

      if (!data || data.error) {
        console.log("Error fetching geolocation data:", data.error);
        return next(); }// Skip if API fails

      const { country_name, latitude, longitude } = data;

      if (!country_name || !latitude || !longitude) {
        console.log("Invalid data from geolocation API:", data);
        return next();} 

      // Check if country already exists in DB
      location = await GeoLocation.findOne({ country: country_name });

      if (location) {
        // Update existing record: Increment visitor count and add IP if unique
        location.visitors += 1;
        if (!location.ips.includes(userIp)) location.ips.push(userIp);
        await location.save();
      } else {
        // Create a new country entry
        await GeoLocation.create({
          country: country_name,
          lat: latitude,
          lng: longitude,
          visitors: 1,
          ips: [userIp],
        });
      }
    }

    next();
  } catch (error) {
    console.error("GeoLocation Middleware Error:", error.message);
    next(); // Continue even if there's an error
  }
};

module.exports = geolocationMiddleware;
