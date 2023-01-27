import { z } from "zod";
import { identity } from "../signals";
import {
  decryptAES,
  decryptRSA,
  encryptAES,
  encryptRSA,
  importPublicKey,
} from "../encryption";
import { KeyRecords } from "../idb";
import { onCreateChat } from "./onCreateChat";
import { onCreateMessage } from "./onCreateMessage";
import { createKey } from "./createKey";
import { onCreateKey } from "./onCreateKey";

export const createKeySchema = z.object({
  type: z.literal("KEY"),
  entryId: z.string(),
  symmetricKey: z.string(),
});

export const createChatSchema = z.object({
  type: z.literal("CHAT"),
  entryId: z.string(),
  displayName: z.string(),
  avatar: z.string().optional(),
});

export const createMessageSchema = z.object({
  type: z.literal("MESSAGE"),
  entryId: z.string(),
  content: z.string(),
  timestamp: z.number(),
});

export const dataSchema = z.object({
  iv: z.string().optional(),
  publicKey: z.string(),
  ciphertext: z.string(),
});

export const send = async (
  destinationPublicKey: string,
  data: z.infer<typeof dataSchema>
) => {
  const body = JSON.stringify(data);
  const url = `https://noti-relay.deno.dev?id=${encodeURIComponent(
    destinationPublicKey
  )}`;
  const res = await fetch(url, { method: "POST", body });
  if (!res.ok) {
    throw new Error(
      `Fetch failed with status: ${res.status}, ${await res.text()}`
    );
  }
};

export const sendWithRSA = async (
  destinationPublicKey: string,
  payload: any
) => {
  if (!identity.value) {
    return;
  }
  const publicKey = await importPublicKey(destinationPublicKey);
  const data: z.infer<typeof dataSchema> = {
    publicKey: identity.value.serializedPublicKey,
    ciphertext: await encryptRSA(publicKey, payload),
  };
  await send(destinationPublicKey, data);
};

export const sendWithAES = async (
  destinationPublicKey: string,
  payload: any
) => {
  if (!identity.value) {
    return;
  }
  const keyRecord = await KeyRecords.get(destinationPublicKey);
  if (!keyRecord) {
    return;
  }
  const { iv, ciphertext } = await encryptAES(keyRecord.symmetricKey, payload);
  const data: z.infer<typeof dataSchema> = {
    iv,
    publicKey: identity.value.serializedPublicKey,
    ciphertext,
  };
  await send(destinationPublicKey, data);
};

export const reducer = async (data: any) => {
  const result = dataSchema.safeParse(data);
  if (!result.success || !identity.value) {
    return;
  }
  let deciphered;
  try {
    if (result.data.iv) {
      const keyRecord = await KeyRecords.get(result.data.publicKey);
      if (!keyRecord) {
        await createKey(result.data.publicKey);
        return;
      }
      deciphered = await decryptAES(
        keyRecord.symmetricKey,
        result.data.iv,
        result.data.ciphertext
      );
    } else {
      deciphered = await decryptRSA(
        identity.value.privateKey,
        result.data.ciphertext
      );
    }
  } catch {
    return;
  }
  console.log(deciphered);
  const payloadResult = z
    .discriminatedUnion("type", [
      createChatSchema,
      createMessageSchema,
      createKeySchema,
    ])
    .safeParse(deciphered);
  if (!payloadResult.success) {
    return;
  }
  switch (payloadResult.data.type) {
    case "KEY":
      return onCreateKey(result.data.publicKey, payloadResult.data);
    case "MESSAGE":
      return onCreateMessage(result.data.publicKey, payloadResult.data);
    case "CHAT":
      return onCreateChat(
        result.data.publicKey,
        payloadResult.data,
        identity.value.displayName,
        identity.value.avatar
      );
  }
};
