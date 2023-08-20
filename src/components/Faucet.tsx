import { Match, Switch } from "solid-js";
import { createRouteAction } from "solid-start";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;
const FAUCET_MACAROON = import.meta.env.VITE_MACAROON_HEX;

const SIMPLE_BUTTON =
  "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

const base64ToHex = (str: string) => {
  const hex = [];
  for (
    let i = 0, bin = atob(str.replace(/[ \r\n]+$/, ""));
    i < bin.length;
    ++i
  ) {
    let tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) tmp = "0" + tmp;
    hex[hex.length] = tmp;
  }
  return hex.join("");
};

const Pop = (props: any) => {
  return (
    <div class="rounded-xl p-4 w-full flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
      {/* {JSON.stringify(props, null, 2)} */}
      <Switch>
        <Match when={props.result}>
          <p>Already paid this invoice, here's the hash:</p>
          <pre class="text-sm font-mono">{base64ToHex(props.result?.payment_hash)}</pre>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Start Over
          </button>
        </Match>
        <Match when={props.error}>
          <img class="mb-2" src="/no-cap.gif" />
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error:&nbsp;</strong>
            <span class="block sm:inline">{props.error.message}</span>
          </div>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Try again?
          </button>
        </Match>
        <Match when={true}>
          <p>You probably screwed this up didn't you?</p>
          <p>
            (Make sure you're using a testnet address btw, and don't ask for more
            than 30,000 sats)
          </p>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </Match>
      </Switch>
    </div>
  );
}

const Faucet = () => {
  const [sendResult, { Form }] = createRouteAction(
    async (formData: FormData) => {
      const bolt11 = formData.get("bolt11")?.toString();
      // did user enter anything?
      if (!bolt11) {
        throw new Error("No bolt11 provided");
      }
      // attempt to decode the invoice to check amount, etc
      const decodeRes = await fetch(`${FAUCET_API_URL}/v1/payreq/${bolt11}`, {
        method: "GET",
        headers: {
          'Grpc-Metadata-macaroon': FAUCET_MACAROON,
        },
      });
      if (!decodeRes.ok) {
        throw new Error(await decodeRes.text());
      } else {
        const response = await decodeRes.json()
        // Is from EttaWallet i.e description is "Invoice + Channel Open"
        if (response.description !== "Welcome to the lightning network") {
          throw new Error("Only paying invoices to open channels. You can use htlc.me");
        }
        // does the invoice ask for more than 30,000 sats
        if (response.num_satoshis > 30000) {
          throw new Error("Your invoice exceeds the allowed amount: 30,000 satoshis");
        }
        // attempt to pay if all checks out.
        const payRes = await fetch(`${FAUCET_API_URL}/v1/channels/transactions`, {
          method: "POST",
          body: JSON.stringify({ payment_request: bolt11 }),
          headers: {
            'Grpc-Metadata-macaroon': FAUCET_MACAROON,
          },
        });
        if (!payRes.ok) {
          throw new Error(await payRes.text());
        } else {
          const response = await payRes.json()
          console.log("payRes: ", response);
          return response;
        }
      }
      
    }
  );

  return (
    <Switch>
      <Match when={sendResult.result || sendResult.error}>
        <Pop result={sendResult.result} error={sendResult.error} />
      </Match>
      <Match when={true}>
        <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full drop-shadow-blue-glow">
          <label for="address">Testnet Bolt11 Payment Request</label>
          <textarea rows="4" name="bolt11" placeholder="Paste a testnet bolt11 invoice starting with lntb..." />
          <input
            type="submit"
            disabled={sendResult.pending}
            value={sendResult.pending ? "Attempting to pay..." : "Pay me"}
            class="mt-4 p-4 rounded-xl text-xl font-semibold bg-[#ff9d00] text-white disabled:bg-gray-500"
          />
        </Form>
      </Match>
    </Switch>
  );
}

export default Faucet