import { z } from "zod";
import { ASYMMETRIC_ALOGRITHM, identity, SYMMETRIC_ALGORITHM } from "./signals";

const createMessageSchema = z.object({
  type: z.literal("CREATE_MESSAGE"),
  asd: z.string(),
});

const createChatSchema = z.object({
  type: z.literal("CREATE_CHAT"),
  displayName: z.string(),
  symmetricKey: z.any(),
});

const acceptChatSchema = z.object({
  type: z.literal("ACCEPT_CHAT"),
});

const dataSchema = z.object({
  iv: z.string().optional(),
  publicKey: z.any(),
  ciphertext: z.string(),
});

const send = async (
  serializedPublicKey: string,
  data: z.infer<typeof dataSchema>
) => {
  const id = encodeURIComponent(serializedPublicKey);
  const body = JSON.stringify(data);
  const url = `https://noti-relay.deno.dev?id=${id}`;
  const res = await fetch(url, { method: "POST", body });
  console.log(res.status);
};

export const createChat = async (serializedPublicKey: string) => {
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(serializedPublicKey),
    ASYMMETRIC_ALOGRITHM,
    true,
    ["encrypt"]
  );
  const symmetricKey = await crypto.subtle.generateKey(
    SYMMETRIC_ALGORITHM,
    true,
    ["encrypt", "decrypt"]
  );
  if (!identity.value) {
    return;
  }
  const payload: z.infer<typeof createChatSchema> = {
    type: "CREATE_CHAT",
    displayName: identity.value.displayName,
    symmetricKey: await crypto.subtle.exportKey("jwk", symmetricKey),
  };
  const arrayBuffer = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    new TextEncoder().encode(JSON.stringify(payload))
  );
  send(serializedPublicKey, {
    publicKey: await crypto.subtle.exportKey("jwk", identity.value.publicKey),
    ciphertext: window.btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    ),
  });
};

const onCreateChat = async (
  destinationPublicKey: JsonWebKey,
  receivedPayload: z.infer<typeof createChatSchema>
) => {
  const symmetricKey = await crypto.subtle.importKey(
    "jwk",
    receivedPayload.symmetricKey,
    SYMMETRIC_ALGORITHM,
    true,
    ["encrypt", "decrypt"]
  );
  const payload: z.infer<typeof acceptChatSchema> = { type: "ACCEPT_CHAT" };
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const arrayBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    symmetricKey,
    new TextEncoder().encode(JSON.stringify(payload))
  );
  if (!identity.value) {
    return;
  }
  send(JSON.stringify(destinationPublicKey), {
    iv: window.btoa(String.fromCharCode(...iv)),
    publicKey: await crypto.subtle.exportKey("jwk", identity.value.publicKey),
    ciphertext: window.btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    ),
  });
};

export const reducer = async (data: any) => {
  const result = dataSchema.safeParse(data);
  if (!result.success) {
    return;
  }
  let payload;
  if (result.data.iv) {
  } else {
    if (!identity.value) {
      return;
    }
    const bytes = window.atob(result.data.ciphertext);
    const ciphertext = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      ciphertext[i] = bytes.charCodeAt(i);
    }
    const arrayBuffer = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      identity.value.privateKey,
      ciphertext
    );
    payload = JSON.parse(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  }
  const payloadResult = z
    .discriminatedUnion("type", [
      createChatSchema,
      acceptChatSchema,
      createMessageSchema,
      z.object({ type: z.literal("ACCEPT_MESSAGE"), content: z.string() }),
    ])
    .safeParse(payload);
  if (!payloadResult.success) {
    return;
  }
  switch (payloadResult.data.type) {
    case "CREATE_MESSAGE":
      return;
    case "ACCEPT_MESSAGE":
      return;
    case "CREATE_CHAT":
      return onCreateChat(result.data.publicKey, payloadResult.data);
    case "ACCEPT_CHAT":
      return;
  }
};
