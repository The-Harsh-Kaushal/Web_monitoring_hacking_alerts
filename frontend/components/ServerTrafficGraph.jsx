import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";



const ServerTrafficGraph = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Load data from props (backend data will replace this in the future)
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      // Example data with random traffic values
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
    <div className="w-full box_shadow_1 h-80 bg-gray-100 p-4 rounded-lg shadow-lg mt-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Server Traffic (Requests per Hour)</h2>
      <ResponsiveContainer width="100%" height="90%">
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
