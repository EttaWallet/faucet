import Faucet from "~/components/Faucet";
import { Show, createEffect, createSignal } from "solid-js";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;
const FAUCET_MACAROON = import.meta.env.VITE_MACAROON_HEX;

export default function Home() {

  const [balance, setBalance] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    async function checkBalance() {
      try {
      const balanceRes = await fetch(`${FAUCET_API_URL}/v1/balance/channels`, {
        method: "GET",
        headers: {
          'Grpc-Metadata-macaroon': FAUCET_MACAROON,
        },
      });
      if (!balanceRes.ok) {
        throw new Error(await balanceRes.text());
      } else {
        const response = await balanceRes.json().then((json) => {
          setBalance(json.balance);
          setLoading(false);
        })
      }
    } catch (e) {
      console.error('Error fetching balance: ', e);
    }
  }

  checkBalance();
  });

  return (
    <main class="flex flex-col gap-4 items-center w-full max-w-[40rem] mx-auto p-5 mt-8">
      <img class="h-20 w-20" src="/logo.png" alt="Etta logo" />
      <h1 class="text-4xl drop-shadow-text-glow font-bold">LN Testnet Faucet</h1>
      <Show when={loading()}>
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
      </Show>
      <Show when={!loading() && parseInt(balance(), 10) > 1000000}>
        <pre class="overflow-x-auto whitespace-pre-line break-none p-4 bg-white/10 rounded-lg">
          {
            `Only paying requests for not more than 30,000 sats. Please only use this if your EttaWallet node has no inbound liquidity or a 0-sat receiving capacity!`
          }
        </pre>
      <Faucet />
      </Show>
      <Show when={!loading() && parseInt(balance(), 10) <= 1000000}>
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error:&nbsp;</strong>
            <span class="block sm:inline">Sorry buddy, this faucet is out of money.</span>
          </div>
      </Show>
      <pre class="overflow-x-auto whitespace-pre-line break-none p-4 bg-white/10 rounded-lg text-center">
          {
            `TB1QH9DJWK5MNY3R6PXXEQWXQYGRM3YAUUTFMVDRZQ \n \n Send us testnet bitcoin on that address ☝️🥺🤞`
          }
        </pre>
    </main>
  );
}
