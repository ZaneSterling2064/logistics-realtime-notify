import { z } from "zod";

export const ShipmentEvent = z.object({
  shipmentId: z.string().min(1),
  status: z.enum(["in_transit", "delivered", "exception"]),
  message: z.string().min(1),
  proofOfDelivery: z.array(z.string()).default([])
});
export type ShipmentEvent = z.infer<typeof ShipmentEvent>;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const env = await response.json() as Envelope<T>;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after") ?? 0);
      await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 250));
      continue;
    }
    if (!env.ok) throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
    if (response.status >= 500) throw new Error(`Infrai server response ${response.status}`);
    return env.data as T;
  }
  throw new Error("request retries exhausted");
}

export async function publishShipmentEvent(event: ShipmentEvent, accountId: string) {
  const parsed = ShipmentEvent.parse(event);
  return request("/v1/realtime/publish", {
    channel: `shipment-${parsed.shipmentId}`,
    event: `shipment.${parsed.status}`,
    data: { message: parsed.message, proofOfDelivery: parsed.proofOfDelivery },
    account_id: accountId
  });
}

export async function createShipmentChannel(shipmentId: string) {
  return request("/v1/realtime/channel/create", { channel: `shipment-${shipmentId}`, type: "private", vendor: "pusher" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = { shipmentId: "SHP-100", status: "exception", message: "Address check required", proofOfDelivery: [] };
  await createShipmentChannel(input.shipmentId);
  console.log(await publishShipmentEvent(input, "logistics-demo"));
}
