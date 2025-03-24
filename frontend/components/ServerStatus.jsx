import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, Server, ShieldAlert } from "lucide-react";



const ServerStatus = ({ isRunning = true, attacks = [] }) => {
  const [serverStatus, setServerStatus] = useState(isRunning);
  const [attackHistory, setAttackHistory] = useState(attacks);

  useEffect(() => {
    // Simulating fetching attack history from backend in future
    if (attacks.length === 0) {
      setAttackHistory([
        { time: "03:45 PM", type: "DDoS Attack", source: "192.168.1.12" },
        { time: "05:20 AM", type: "SQL Injection", source: "203.145.22.5" },
        { time: "11:15 PM", type: "XSS Attack", source: "176.98.45.33" },
        { time: "07:05 AM", type: "Brute Force Attack", source: "88.102.34.12" },
      ]);
    } else {
      setAttackHistory(attacks);
    }
  }, [attacks]);

  return (
    <div className="w-full box_shadow_1 bg-gray-900 text-white p-8 rounded-lg shadow-lg mt-6 mb-6">
      {/* Header */}
      <h2 className="text-3xl font-bold text-green-400 mb-6 text-center">
        🛡️ Cyber Shield: Protecting Every Byte
      </h2>

      {/* Server & Security Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Server Status */}
        <div className="flex items-center justify-between bg-gray-800 p-5 rounded-md">
          <div className="flex items-center">
            <Server className="w-6 h-6 mr-3 text-blue-400" />
            <span className="text-lg font-semibold">Server Status:</span>
          </div>
          {serverStatus ? (
            <span className="flex items-center text-green-400">
              <ShieldCheck className="w-5 h-5 mr-2" /> Running Smoothly
            </span>
          ) : (
            <span className="flex items-center text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" /> Server Down
            </span>
          )}
        </div>

        {/* Security Status */}
        <div className="flex items-center justify-between bg-gray-800 p-5 rounded-md">
          <div className="flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-yellow-400" />
            <span className="text-lg font-semibold">Security Status:</span>
          </div>
          {attackHistory.length === 0 ? (
            <span className="text-green-400">No Threats Detected</span>
          ) : (
            <span className="text-red-400">Threats Detected!</span>
          )}
        </div>
      </div>

      {/* Attack History Section */}
      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-4">⚠️ Attack History:</h3>
        {attackHistory.length > 0 ? (
          <div className="bg-gray-800 p-4 rounded-md overflow-y-auto max-h-60">
            <ul className="text-sm space-y-3">
              {attackHistory.map((attack, index) => (
                <li key={index} className="flex justify-between p-3 bg-gray-700 rounded-md">
                  <span className="text-red-400 font-semibold">{attack.type}</span>
                  <span className="text-gray-300">{attack.source}</span>
                  <span className="text-gray-400">{attack.time}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-green-400">No past attacks recorded.</p>
        )}
      </div>
    </div>
  );
};

export default ServerStatus;
