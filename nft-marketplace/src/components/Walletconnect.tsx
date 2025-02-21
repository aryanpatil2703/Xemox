import { usePrivy } from '@privy-io/react-auth';

export default function WalletConnect() {
  
  const { login } = usePrivy();
  return (
    <>
      <div className="Wallet_Connect" style={{display: "flex", justifyContent: "flex-end", position: "absolute", top: "20px", right: "20px", margin: "10px"}}>
          <button onClick={login} style={{backgroundColor: "blue", color: "white", border: "5px", borderRadius: "10px",  padding: "15px"}}>
            Connect Wallet 
          </button>
      </div>
    </>
  )
}