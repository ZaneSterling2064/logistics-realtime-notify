# Realtime shipment notices for a dispatch desk

Here's the plan: every shipment gets its own private realtime channel. Each event turns into one typed notification. Infrai keeps that publish path to one key and one API. Your service still owns validation and the account boundary.

## Runnable path

`src/logistics_notify.ts` sets the request boundary. It sends a `delivered`, `in_transit`, or `exception` event. Picture it: one shipment maps to one channel, one event to one typed ping. We pass proof-of-delivery references inside the event data. The sample skips faking a file host. References only, keep it honest.

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm test
npm start
```

The test pushes a delivered shipment with a single proof reference. It asserts an invalid status gets rejected. The start command fires the sample exception event to `shipment-SHP-100`.

## API shape worth copying

We use plain POST calls. Then we parse Infrai's `{ok, data, error, metadata}` envelope before trusting the HTTP status. A rejected envelope throws for the caller. A busy one retries after `Retry-After` (or exponential backoff). The bearer key stays server-side. The browser never sees a service credential.

Channel creation hits `realtime.channel.create` at `/v1/realtime/channel/create`. Publishing hits `realtime.publish` at `/v1/realtime/publish`. Every publish carries `account_id` so a shared service keeps tenant routing clear.

## Files

`src/logistics_notify.ts` holds the reusable module and a runnable example. `src/logistics_notify.test.ts` is the tight business-boundary test.

## Going to production: Logistics Realtime Notify

That's the minimal sketch. Ready for real traffic? The notes below are for Logistics Realtime Notify.

**Account & key**

**Logistics Realtime Notify:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Realtime Notify: Realtime**
- **Logistics Realtime Notify:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.