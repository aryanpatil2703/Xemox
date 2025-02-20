import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { usePrivy } from '@privy-io/react-auth';

function App() {
  
  const { login } = usePrivy();
  return (
    <>
      
      <div className="card">
        <button onClick={login}>
          Connect Wallet 
        </button>
      </div>
      <div className="card">
        <button onClick={login}>
          Connect Wallet 
        </button>
      </div>
    </>
  )
}

export default App
