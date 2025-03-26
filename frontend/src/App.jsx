import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Main from '../components/Main'
import { Route,Routes } from 'react-router-dom'
import WebMonireport from '../components/WebMonireport'
function App() {
 

  return (
    <>
    <Routes>
      <Route path='/' element={<Main/>} />
      <Route path='/full-traffic-report' element={<WebMonireport/>} />
    </Routes>
      
      
    </>
  )
}

export default App
