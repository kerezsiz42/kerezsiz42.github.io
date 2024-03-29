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
  createdAt: z.number(),
  receivedAt: z.number().optional(),
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

export const reducer = async (data: string) => {
  const result = dataSchema.safeParse(JSON.parse(data));
  if (!result.success || !identity.value) {
    return;
  }
  try {
    if (result.data.iv) {
      let keyRecord = await KeyRecords.get(result.data.publicKey);
      if (!keyRecord) {
        createKey(result.data.publicKey);
        return;
      }
      const decryted = await decryptAES(
        keyRecord.symmetricKey,
        result.data.iv,
        result.data.ciphertext
      );
      const res = z
        .discriminatedUnion("type", [createChatSchema, createMessageSchema])
        .safeParse(decryted);
      if (!res.success) {
        return;
      }
      console.log(res.data);
      switch (res.data.type) {
        case "MESSAGE":
          return onCreateMessage(
            result.data.publicKey,
            res.data,
            identity.value.serializedPublicKey
          );
        case "CHAT":
          return onCreateChat(
            result.data.publicKey,
            res.data,
            identity.value.displayName,
            identity.value.avatar
          );
      }
    } else {
      const decryted = await decryptRSA(
        identity.value.privateKey,
        result.data.ciphertext
      );
      const res = createKeySchema.safeParse(decryted);
      if (res.success) {
        console.log(res.data);
        onCreateKey(result.data.publicKey, res.data);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
