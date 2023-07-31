import Faucet from "~/components/Faucet";

export default function Home() {
  return (
    <main class="flex flex-col gap-4 items-center w-full max-w-[40rem] mx-auto p-5 mt-8">
      <img class="h-20 w-20" src="/logo.png" alt="Etta logo" />
      <h1 class="text-4xl drop-shadow-text-glow font-bold">LN Testnet Faucet</h1>
      <pre class="overflow-x-auto whitespace-pre-line break-none p-4 bg-white/10 rounded-lg">
          {
            `Only paying requests for not more than 30,000 sats. Please only use this if your EttaWallet node has no inbound liquidity or a 0-sat receiving capacity!`
          }
        </pre>
      <Faucet />
      <pre class="overflow-x-auto whitespace-pre-line break-none p-4 bg-white/10 rounded-lg text-center">
          {
            `2NFs14UZ831Ys8LNGf877h9eUHykfrb7waf \n \n Send us testnet bitcoin on that address ☝️🥺`
          }
        </pre>
    </main>
  );
}
