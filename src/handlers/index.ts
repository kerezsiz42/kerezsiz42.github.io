import { z } from "zod";
import { identity } from "../signals";
import { decryptAES, decryptRSA } from "../encryption";
import { Chats } from "../idb";
import { onCreateChat } from "./onCreateChat";
import { onCreateMessage } from "./onCreateMessage";
import { onReceived } from "./onReceived";

export const createMessageSchema = z.object({
  type: z.literal("MESSAGE"),
  content: z.string(),
  timestamp: z.number(),
  id: z.string(),
});

export const receiveMessageSchema = z.object({
  type: z.literal("RECEIVED"),
  id: z.string(),
});

export const createChatSchema = z.object({
  type: z.literal("CHAT"),
  symmetricKey: z.string(),
  displayName: z.string(),
  avatar: z.string().optional(),
});

const dataSchema = z.object({
  iv: z.string().optional(),
  publicKey: z.string(),
  ciphertext: z.string(),
});

export const send = async (
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

export const reducer = async (data: any) => {
  const result = dataSchema.safeParse(data);
  if (!result.success) {
    return;
  }
  let payload;
  if (result.data.iv) {
    const chat = await Chats.get(result.data.publicKey);
    if (!chat || !chat.symmetricKey) {
      return;
    }
    payload = await decryptAES(
      chat.symmetricKey,
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
      createMessageSchema,
      receiveMessageSchema,
    ])
    .safeParse(payload);
  if (!payloadResult.success) {
    return;
  }
  switch (payloadResult.data.type) {
    case "MESSAGE":
      return onCreateMessage(result.data.publicKey, payloadResult.data);
    case "CHAT":
      return onCreateChat(result.data.publicKey, payloadResult.data);
    case "RECEIVED":
      return onReceived(payloadResult.data);
  }
};
