import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { NavLink, Link } from "react-router-dom";
const ServerTrafficGraph = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      setChartData([
        { hour: "00:00", requests: 120 },
        { hour: "01:00", requests: 80 },
        { hour: "02:00", requests: 60 },
        { hour: "03:00", requests: 45 },
        { hour: "04:00", requests: 30 },
        { hour: "05:00", requests: 50 },
        { hour: "06:00", requests: 90 },
        { hour: "07:00", requests: 140 },
        { hour: "08:00", requests: 200 },
        { hour: "09:00", requests: 300 },
        { hour: "10:00", requests: 400 },
        { hour: "11:00", requests: 600 },
        { hour: "12:00", requests: 750 },
        { hour: "13:00", requests: 820 },
        { hour: "14:00", requests: 670 },
        { hour: "15:00", requests: 580 },
        { hour: "16:00", requests: 490 },
        { hour: "17:00", requests: 620 },
        { hour: "18:00", requests: 800 },
        { hour: "19:00", requests: 920 },
        { hour: "20:00", requests: 1100 },
        { hour: "21:00", requests: 1200 },
        { hour: "22:00", requests: 1000 },
        { hour: "23:00", requests: 850 },
      ]);
    }
  }, [data]);

  return (
    <div className="w-full box_shadow_1 h-100 bg-gray-100 p-4 rounded-lg shadow-lg ">
      {/* Heading and Link Container */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 ml-4">
          Server Traffic (Requests per Hour)
        </h2>
        <NavLink to="/full-traffic-report" className="text-blue-500 hover:text-blue-700 flex items-center">
          View Full Report <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
        </NavLink>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServerTrafficGraph;
