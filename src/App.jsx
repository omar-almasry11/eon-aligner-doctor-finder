import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { testAirtableConnection, testGoogleMapsConnection } from './utils/api'
import Button from './components/Button.jsx'

function App() {
  
  // Test API connections on component mount
  useEffect(() => {
    testAirtableConnection()
    testGoogleMapsConnection()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-red-500">Eon Aligner Doctor Finder</h1>
      <div className="card">
        <Button iconName='' onClick={() => alert('Primary Button Clicked!')}>
          Primary Button
        </Button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
