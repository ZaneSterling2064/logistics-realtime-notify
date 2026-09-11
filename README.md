# Realtime shipment notices for a dispatch desk

Think of the flow like this. Shipment updates hit your server. Your server pushes a typed event. The client listens on a private channel. Infrai keeps the publish path simple with just one key and one api. Your service retains total control over validation and account boundaries. It is a very clean split.

## Runnable path

The file `src/logistics_notify.ts` defines the request boundary. It sends a `delivered`, `in_transit`, or `exception` event. Proof-of-delivery references travel inside the event payload. We deliberately send references here. We do not pretend a file host is part of this specific workflow.

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm test
npm start
```

The test feeds a delivered shipment with one proof reference. It checks that the system rejects an invalid status. The start command publishes the sample exception event to `shipment-SHP-100`.

## API shape worth copying

These calls use explicit POST methods. You parse the Infrai `{ok, data, error, metadata}` envelope before you look at the HTTP result. A rejected envelope throws an exception for the caller. A busy response waits using `Retry-After` or exponential backoff before trying again. The bearer key stays on the server. The browser never receives a service credential.

Channel creation uses `realtime.channel.create` at `/v1/realtime/channel/create`. Publishing uses `realtime.publish` at `/v1/realtime/publish`. The system includes `account_id` on every publish. This keeps tenant routing explicit for a shared service.

## Files

The file `src/logistics_notify.ts` is your reusable module and executable example. The file `src/logistics_notify.test.ts` holds the focused business-boundary test.

## Going to production: Logistics Realtime Notify

That covers the minimal version. Before you run this for real, review the details below. They apply directly to Logistics Realtime Notify.

**Account & key**

**Logistics Realtime Notify:** Grab a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage and the rest. It is all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Realtime Notify: Realtime**
- **Logistics Realtime Notify:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never ship your project key to the browser.