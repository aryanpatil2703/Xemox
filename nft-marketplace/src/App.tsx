import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WalletConnect from './components/WalletConnect'
import { usePrivy } from '@privy-io/react-auth';
import Header from './components/Header';

function App() {
  
  return (
    <>
      <nav>
        <WalletConnect />
      </nav>
      
      <Header/>
    
    </>
  )
}

export default App
