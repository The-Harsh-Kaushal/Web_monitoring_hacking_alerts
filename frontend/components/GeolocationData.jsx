import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";

const GeolocationData = ({ data }) => {
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setGeoData(data);
    } else {
      setGeoData([
        { country: "USA", visitors: 1200, lat: 37.7749, lng: -122.4194 },
        { country: "India", visitors: 950, lat: 28.6139, lng: 77.209 },
        { country: "UK", visitors: 700, lat: 51.5074, lng: -0.1278 },
        { country: "Germany", visitors: 500, lat: 52.52, lng: 13.405 },
        { country: "Brazil", visitors: 400, lat: -23.5505, lng: -46.6333 },
      ]);
    }
  }, [data]);

  return (
    <div className="w-full p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Visitor Geolocation Data</h2>

      {/* Map Display */}
      <div className="h-80 w-full mb-6">
        <MapContainer center={[20, 0]} zoom={2} className="h-full w-full rounded-lg">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Replacing markers with small red dots */}
          {geoData.map((location, index) => (
            <Circle
              key={index}
              center={[location.lat, location.lng]}
              pathOptions={{ color: "red", fillColor: "red", fillOpacity: 1 }}
              radius={50000} // Small radius for a dot effect
            />
          ))}
        </MapContainer>
      </div>

      {/* Table Display */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Country</th>
            <th className="border border-gray-300 p-2">Visitors</th>
          </tr>
        </thead>
        <tbody>
          {geoData.map((location, index) => (
            <tr key={index} className="text-center">
              <td className="border border-gray-300 p-2">{location.country}</td>
              <td className="border border-gray-300 p-2">{location.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeolocationData;
