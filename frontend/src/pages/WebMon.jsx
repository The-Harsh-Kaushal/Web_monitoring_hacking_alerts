import React from 'react'
import Navbar from '../../components/Navbar'
import ServerTrafficGraph from '../../components/ServerTrafficGraph'
import PageViewsPerSession from '../../components/PageViewsPerSession'
import SessionDuration from '../../components/SessionDuration'
import GeolocationData from '../../components/GeolocationData'


const WebMon = () => {
  return (
    <div>
        <Navbar/>
        <div>
          <ServerTrafficGraph/>
          <PageViewsPerSession/>
          <SessionDuration/>
         <GeolocationData/>
        </div>
    </div>
  )
}

export default WebMon