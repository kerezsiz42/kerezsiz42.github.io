import { effect, signal } from "@preact/signals";
import { publicKeyToBase64 } from "../functions";
import { ReconnectingWebSocket } from "../ReconnectingWebSocket";
import { identity } from "./IdentityStoreSignals";

export const connected = signal(false);
const rws = new ReconnectingWebSocket();

effect(async () => {
  if (!identity.value) {
    rws.close();
    return;
  }
  const publicKey = encodeURIComponent(
    await publicKeyToBase64(identity.value.publicKey)
  );
  rws.connect(
    `wss://noti-relay.deno.dev?publicKey=${publicKey}`,
    (isConnected) => {
      connected.value = isConnected;
    },
    console.log
  );
});
