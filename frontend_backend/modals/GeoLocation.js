const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GeoLocationSchema = new Schema({
    country: { type: String, required: true, unique: true }, // Unique country name
    lat: { type: Number, required: true },  // Latitude for mapping
    lng: { type: Number, required: true },  // Longitude for mapping
    visitors: { type: Number, default: 1 }, // Total visitor count for the country
    ips: [{ type: String, unique: true }]   // List of unique IPs from this country
}, { timestamps: true });

module.exports = mongoose.model('GeoLocation', GeoLocationSchema);
