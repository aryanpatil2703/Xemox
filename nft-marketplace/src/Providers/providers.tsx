import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi"; // Ensure correct import
import { WagmiConfig } from "./wagmiConfig"; // Ensure correct config import

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          logo: "https://your-logo-url",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {/* ✅ Corrected WagmiProvider usage */}
        <WagmiProvider config={WagmiConfig}>
          {children} {/* Ensure children are inside WagmiProvider */}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
