import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PageViewsPerSession = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      setChartData([
        { pagesVisited: "1 Page", sessions: 300 },
        { pagesVisited: "2 Pages", sessions: 220 },
        { pagesVisited: "3 Pages", sessions: 180 },
        { pagesVisited: "4 Pages", sessions: 150 },
        { pagesVisited: "5+ Pages", sessions: 100 },
      ]);
    }
  }, [data]);

  return (
    <div className="w-full h-80 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Page Views per Session</h2>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="pagesVisited" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sessions" fill="#8884d8" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PageViewsPerSession;
