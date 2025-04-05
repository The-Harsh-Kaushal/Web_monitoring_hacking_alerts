import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Navbar from '../../components/Navbar';
import ServerTrafficGraph from '../../components/ServerTrafficGraph';
import PageViewsPerSession from '../../components/PageViewsPerSession';
import SessionDuration from '../../components/SessionDuration';
import GeolocationData from '../../components/GeolocationData';

// ✅ Axios instance directly in this file
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // update this to your backend URL if different
  headers: {
    'Content-Type': 'application/json',
  },
});

const WebMon = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [pageViewsData, setPageViewsData] = useState([]);
  const [sessionDurationData, setSessionDurationData] = useState([]);
  const [geoLocationData, setGeoLocationData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          trafficRes,
          pageViewsRes,
          durationRes,
          geoRes
        ] = await Promise.all([
          axiosInstance.get('/api/server-traffic'),
          axiosInstance.get('/api/page-views-per-session'),
          axiosInstance.get('/api/session-duration'),
          axiosInstance.get('/api/geo-location-stats')
        ]);

        setTrafficData(trafficRes.data);
        setPageViewsData(pageViewsRes.data);
        setSessionDurationData(durationRes.data);
        setGeoLocationData(geoRes.data);
      } catch (error) {
        console.error('Error fetching web monitoring data:', error);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-8">
        <ServerTrafficGraph data={trafficData} />
        <PageViewsPerSession data={pageViewsData} />
        <SessionDuration data={sessionDurationData} />
        <GeolocationData data={geoLocationData} />
      </div>
    </div>
  );
};

export default WebMon;
