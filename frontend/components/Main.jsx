import React from 'react'
import Navbar from './Navbar'
import ServerTrafficGraph from './ServerTrafficGraph'
import ServerStatus from './ServerStatus'

const Main = () => {
  return (
    <div className='text-red-500 flex flex-col gap-4'>
        <Navbar/>
        {/* web monitoring */}
       <ServerTrafficGraph/>
       <ServerStatus/>
    </div>
  )
}

export default Main