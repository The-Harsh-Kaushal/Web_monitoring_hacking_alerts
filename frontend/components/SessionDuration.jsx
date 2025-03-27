import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SessionDuration = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      setChartData([
        { duration: "< 1 min", sessions: 400 },
        { duration: "1-3 min", sessions: 350 },
        { duration: "3-5 min", sessions: 250 },
        { duration: "5-10 min", sessions: 180 },
        { duration: "10+ min", sessions: 120 },
      ]);
    }
  }, [data]);

  return (
    <div className="w-full h-80 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Session Duration</h2>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="duration" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sessions" fill="#82ca9d" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SessionDuration;
