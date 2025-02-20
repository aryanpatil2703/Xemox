import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { usePrivy } from '@privy-io/react-auth';
import Header from './components/Header';

function App() {
  
  const { login } = usePrivy();
  return (
    <>
      <Header/>
    
    </>
  )
}

export default App
