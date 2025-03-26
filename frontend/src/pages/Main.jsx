import React from "react";

import Navbar from "../../components/Navbar";
import ServerTrafficGraph from "../../components/ServerTrafficGraph";
import ServerStatus from "../../components/ServerStatus";
const Main = () => {
  return (
    <div className="text-red-500 flex flex-col gap-4">
      <Navbar />
      {/* web monitoring */}
      <ServerTrafficGraph />
      <ServerStatus/>
    </div>
  );
};

export default Main;
