import { ShipmentEvent } from "./logistics_notify.ts";

const delivered = ShipmentEvent.parse({ shipmentId: "SHP-9", status: "delivered", message: "Signed at dock", proofOfDelivery: ["pod-9.pdf"] });
if (delivered.status !== "delivered" || delivered.proofOfDelivery.length !== 1) throw new Error("delivery event should retain proof");
let rejected = false;
try { ShipmentEvent.parse({ shipmentId: "", status: "unknown", message: "" }); } catch { rejected = true; }
if (!rejected) throw new Error("invalid shipment event should be rejected");
console.log("shipment event validation passed");
