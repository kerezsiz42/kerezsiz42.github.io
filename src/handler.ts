import { z } from "zod";
import { ASYMMETRIC_ALOGRITHM, identity, SYMMETRIC_ALGORITHM } from "./signals";

const createMessageSchema = z.object({
  type: z.literal("CREATE_MESSAGE"),
  asd: z.string(),
});

const createChatSchema = z.object({
  type: z.literal("CREATE_CHAT"),
  displayName: z.string(),
  serializedSymmetricKey: z.string(),
});

const dataSchema = z.object({
  encryption: z.union([z.literal("RSA"), z.literal("AES")]),
  from: z.string(),
  payload: z.any(),
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
  const serializedSymmetricKey = JSON.stringify(
    await crypto.subtle.exportKey("jwk", symmetricKey)
  );
  const arrayBuffer = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    new TextEncoder().encode(serializedSymmetricKey)
  );
  const payload = JSON.stringify({
    serializedSymmetricKey: window.btoa(new TextDecoder().decode(arrayBuffer)),
  });
  if (!identity.value) {
    return;
  }
  send(serializedPublicKey, {
    encryption: "RSA",
    from: JSON.stringify(
      await crypto.subtle.exportKey("jwk", identity.value.publicKey)
    ),
    payload,
  });
};

const onCreateChat = async (
  from: string,
  payload: z.infer<typeof createChatSchema>
) => {
  console.log(from, payload);
};

export const reducer = async (data: any) => {
  const result = dataSchema.safeParse(data);
  if (!result.success) {
    return;
  }
  let payload;
  if (result.data.encryption === "RSA") {
    if (!identity.value) {
      return;
    }
    const arrayBuffer = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      identity.value.privateKey,
      new TextEncoder().encode(result.data.payload)
    );
    payload = JSON.parse(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  } else {
  }
  const payloadResult = z
    .discriminatedUnion("type", [
      createChatSchema,
      z.object({ type: z.literal("ACCEPT_CHAT"), content: z.string() }),
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
      return onCreateChat(result.data.from, payloadResult.data);
    case "ACCEPT_CHAT":
      return;
  }
};
