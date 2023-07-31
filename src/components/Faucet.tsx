import { Match, Switch } from "solid-js";
import { createRouteAction } from "solid-start";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;
const FAUCET_MACAROON = import.meta.env.VITE_MACAROON_HEX;

const SIMPLE_BUTTON =
  "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

const Pop = (props: any) => {
  return (
    <div class="rounded-xl p-4 w-full flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
      {/* {JSON.stringify(props, null, 2)} */}
      <Switch>
        <Match when={props.result}>
          <p>Paid the invoice, here's your proof</p>
          <pre class="text-sm font-mono">{props.result?.payment_hash}</pre>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Start Over
          </button>
        </Match>
        <Match when={props.error}>
          <p>Something went wrong</p>
          <code>{props.error.message}</code>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Try again
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
      try {
        // also maybe we can first get details about our node:
        // 1. What's our balance?
        // 2. If balance is less than 1,000,000 sats, reject all.
        if (!bolt11) {
          throw new Error("No bolt11 provided");
        } else {
          // first decode the invoice to check:
          // 1. has invoice been paid or rejected
          // 2. Is from EttaWallet i.e description is "Invoice + Channel Open"
          // 2. does the invoice ask for more than 30,000 sats
          const res = await fetch(`${FAUCET_API_URL}/v1/channels/transactions`, {
            method: "POST",
            body: JSON.stringify({ payment_request: bolt11, }),
            headers: {
              'Grpc-Metadata-macaroon': FAUCET_MACAROON,
            },
          });
          if (!res.ok) {
            throw new Error(await res.text());
          } else {
            const response = await res.json()
            return response;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  );

  return (
    <Switch>
      <Match when={sendResult.result || sendResult.error}>
        <img src="/no-cap.gif" />
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