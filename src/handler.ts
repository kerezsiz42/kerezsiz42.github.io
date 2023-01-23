import { z } from "zod";
import { addChat } from "./idb";
import { Chat, identity } from "./signals";
import {
  decryptRSA,
  encryptAES,
  encryptRSA,
  exportPublicKey,
  exportSymmetricKey,
  importPublicKey,
  importSymmetricKey,
  SYMMETRIC_ALGORITHM,
} from "./encryption";

const createMessageSchema = z.object({
  type: z.literal("CREATE_MESSAGE"),
  asd: z.string(),
});

const createChatSchema = z.object({
  type: z.literal("CREATE_CHAT"),
  displayName: z.string(),
  symmetricKey: z.string(),
  avatar: z.string().optional(),
});

const acceptChatSchema = z.object({
  type: z.literal("ACCEPT_CHAT"),
});

const dataSchema = z.object({
  iv: z.string().optional(),
  publicKey: z.string(),
  ciphertext: z.string(),
});

const send = async (
  destinationPublicKey: string,
  data: z.infer<typeof dataSchema>
) => {
  const body = JSON.stringify(data);
  const url = `https://noti-relay.deno.dev?id=${destinationPublicKey}`;
  const res = await fetch(url, { method: "POST", body });
  console.log(res.status);
};

export const createChat = async (serializedPublicKey: string) => {
  const publicKey = await importPublicKey(serializedPublicKey);
  const symmetricKey = await crypto.subtle.generateKey(
    SYMMETRIC_ALGORITHM,
    true,
    ["encrypt", "decrypt"]
  );
  if (!identity.value) {
    return;
  }
  const data: z.infer<typeof createChatSchema> = {
    type: "CREATE_CHAT",
    displayName: identity.value.displayName,
    symmetricKey: await exportSymmetricKey(symmetricKey),
  };
  const ciphertext = await encryptRSA(publicKey, data);
  send(serializedPublicKey, {
    publicKey: await exportPublicKey(identity.value.publicKey),
    ciphertext,
  });
  console.log("hello");
};

const onCreateChat = async (
  destinationPublicKey: string,
  receivedPayload: z.infer<typeof createChatSchema>
) => {
  const symmetricKey = await importSymmetricKey(receivedPayload.symmetricKey);
  const chat: Chat = {
    symmetricKey,
    publicKey: await importPublicKey(destinationPublicKey),
    serializedPublicKey: destinationPublicKey,
    displayName: receivedPayload.displayName,
    avatar: receivedPayload.avatar,
  };
  console.log(chat);
  // await addChat(chat);
  const payload: z.infer<typeof acceptChatSchema> = { type: "ACCEPT_CHAT" };
  const { iv, ciphertext } = await encryptAES(symmetricKey, payload);
  if (!identity.value) {
    return;
  }
  send(destinationPublicKey, {
    iv,
    publicKey: await exportPublicKey(identity.value.publicKey),
    ciphertext,
  });
};

const onAcceptChat = () => {};

const onCreateMessage = () => {};

const onAcceptMessage = () => {};

export const reducer = async (data: any) => {
  const result = dataSchema.safeParse(data);
  if (!result.success) {
    return;
  }
  let payload;
  if (result.data.iv) {
    console.log(result.data);
  } else {
    if (!identity.value) {
      return;
    }
    payload = await decryptRSA(
      identity.value.privateKey,
      result.data.ciphertext
    );
    console.log(payload);
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
      return onCreateMessage();
    case "ACCEPT_MESSAGE":
      return onAcceptMessage();
    case "CREATE_CHAT":
      return onCreateChat(result.data.publicKey, payloadResult.data);
    case "ACCEPT_CHAT":
      return onAcceptChat();
  }
};
