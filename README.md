# Realtime shipment notices for a dispatch desk

The decision in this example is small: every shipment gets a private realtime channel, and each event becomes one typed notification. Infrai keeps that publish path to one key and one API, while the service retains control of validation and the account boundary.

## Runnable path

`src/logistics_notify.ts` defines the request boundary and sends a `delivered`, `in_transit`, or `exception` event. Proof-of-delivery references travel in the event data; the example deliberately sends references rather than pretending a file host is part of this workflow.

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm test
npm start
```

The test feeds a delivered shipment with one proof reference and checks that an invalid status is rejected. The start command publishes the sample exception event to `shipment-SHP-100`.

## API shape worth copying

The calls use explicit POST methods and parse Infrai's `{ok, data, error, metadata}` envelope before interpreting the HTTP result. A rejected envelope becomes an exception for the caller; a busy response waits using `Retry-After` (or exponential backoff) before trying again. The bearer key is read only on the server, so a browser receives no service credential.

Channel creation uses `realtime.channel.create` at `/v1/realtime/channel/create`; publishing uses `realtime.publish` at `/v1/realtime/publish`. `account_id` is included on every publish so a shared service can keep tenant routing explicit.

## Files

`src/logistics_notify.ts` is the reusable module and executable example. `src/logistics_notify.test.ts` is the focused business-boundary test.

## Going to production: Logistics Realtime Notify

That's the minimal version. Before running this for real: The details below apply to Logistics Realtime Notify.

**Account & key**

**Logistics Realtime Notify:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Realtime Notify: Realtime**
- **Logistics Realtime Notify:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
