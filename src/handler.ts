import { z } from "zod";
import { Chat, currentChat, identity } from "./signals";
import {
  decryptAES,
  decryptRSA,
  encryptRSA,
  exportPublicKey,
  exportSymmetricKey,
  importPublicKey,
  importSymmetricKey,
  SYMMETRIC_ALGORITHM,
} from "./encryption";
import { Chats, Keys } from "./idb";

const createMessageSchema = z.object({
  type: z.literal("CREATE_MESSAGE"),
});

const createChatSchema = z.object({
  type: z.literal("CREATE_CHAT"),
  symmetricKey: z.string(),
  displayName: z.string(),
  avatar: z.string().optional(),
});

const acceptChatSchema = z.object({
  type: z.literal("ACCEPT_CHAT"),
  avatar: z.string().optional(),
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
  if (!res.ok) {
    throw new Error(
      `Fetch failed with status: ${res.status}, ${await res.text()}`
    );
  }
};

export const createChat = async (
  serializedPublicKey: string,
  displayName: string
) => {
  const publicKey = await importPublicKey(serializedPublicKey);
  const symmetricKey = await crypto.subtle.generateKey(
    SYMMETRIC_ALGORITHM,
    true,
    ["encrypt", "decrypt"]
  );
  await Keys.put(serializedPublicKey, symmetricKey);
  if (!identity.value) {
    throw new Error("no identity");
  }
  const chat: Chat = {
    publicKey: await importPublicKey(serializedPublicKey),
    serializedPublicKey,
    displayName,
  };
  await Chats.put(chat);
  const serializedSymmetricKey = await exportSymmetricKey(symmetricKey);
  const data: z.infer<typeof createChatSchema> = {
    type: "CREATE_CHAT",
    displayName: identity.value.displayName,
    symmetricKey: serializedSymmetricKey,
  };
  const ciphertext = await encryptRSA(publicKey, data);
  await send(serializedPublicKey, {
    publicKey: await exportPublicKey(identity.value.publicKey),
    ciphertext,
  });
  if (!currentChat.value) {
    currentChat.value = chat;
  }
};

const onCreateChat = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createChatSchema>
) => {
  const symmetricKey = await importSymmetricKey(payload.symmetricKey);
  await Keys.put(serializedPublicKey, symmetricKey);
  const chat: Chat = {
    publicKey: await importPublicKey(serializedPublicKey),
    serializedPublicKey,
    displayName: payload.displayName,
  };
  await Chats.put(chat);
};

export const createMessage = async (messageToSend: string) => {
  // if (!identity.value) {
  //   throw new Error("no identity");
  // }
  // const data: z.infer<typeof acceptChatSchema> = {
  //   type: "ACCEPT_CHAT",
  //   avatar: identity.value.avatar,
  // };
  // const { iv, ciphertext } = await encryptAES(symmetricKey, data);
  // await send(destinationPublicKey, {
  //   iv,
  //   publicKey: await exportPublicKey(identity.value.publicKey),
  //   ciphertext,
  // });
};

const onCreateMessage = () => {};

const onAcceptMessage = () => {};

export const reducer = async (data: any) => {
  const result = dataSchema.safeParse(data);
  if (!result.success) {
    return;
  }
  let payload;
  if (result.data.iv) {
    const chat = await Chats.get(result.data.publicKey);
    const symmetricKey = await Keys.get(result.data.publicKey);
    if (!chat || !symmetricKey) {
      return;
    }
    payload = await decryptAES(
      symmetricKey,
      result.data.iv,
      result.data.ciphertext
    );
  } else {
    if (!identity.value) {
      throw new Error("no identity");
    }
    payload = await decryptRSA(
      identity.value.privateKey,
      result.data.ciphertext
    );
  }
  console.log(payload);
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
  }
};
