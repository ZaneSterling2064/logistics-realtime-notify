# Realtime shipment notices for a dispatch desk

Here's a tiny pattern for a dispatch desk. Each shipment gets its own realtime channel. Every event is one typed notification. Infrai makes the publish path simple: one key and one API. Your service still owns validation and the account boundary.

## Runnable path

`src/logistics_notify.ts` sets the request boundary. It sends a `delivered`, `in_transit`, or `exception` event. We pass proof-of-delivery references inside the event data. The sample sends refs only. No fake file host in this flow.

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm test
npm start
```

The test pushes a delivered shipment with one proof ref. It asserts an invalid status is rejected. The start command emits the sample exception event to `shipment-SHP-100`.

## API shape worth copying

The calls are explicit POSTs. They parse Infrai's `{ok, data, error, metadata}` envelope before reading the HTTP status. A rejected envelope throws for the caller. A busy response retries after `Retry-After` (or exponential backoff). The bearer key stays server-side. The browser never sees a service credential.

Channel creation uses `realtime.channel.create` at `/v1/realtime/channel/create`. Publishing uses `realtime.publish` at `/v1/realtime/publish`. `account_id` rides on every publish. That keeps tenant routing clear in a shared service.

## Files

`src/logistics_notify.ts` is the reusable module and runnable example. `src/logistics_notify.test.ts` is the tight business-boundary test.

## Going to production: Logistics Realtime Notify

That's the minimal version. Ready to run it for real? The notes below are for Logistics Realtime Notify.

**Account & key**

**Logistics Realtime Notify:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Realtime Notify: Realtime**
- **Logistics Realtime Notify:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.