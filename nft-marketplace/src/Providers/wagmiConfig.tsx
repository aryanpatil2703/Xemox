import {createConfig} from '@privy-io/wagmi';
import {base, baseSepolia} from 'viem/chains';
import {http} from 'wagmi';

// Replace this with your app's required chains
// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`

export const WagmiConfig = createConfig({
  chains: [base, baseSepolia], // Pass your required chains as an array
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    // For each of your required chains, add an entry to `transports` with
    // a key of the chain's `id` and a value of `http()`
  },
});