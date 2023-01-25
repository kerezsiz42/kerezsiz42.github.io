import { z } from "zod";
import { createChatSchema, send } from ".";
import {
  importPublicKey,
  SYMMETRIC_ALGORITHM,
  exportSymmetricKey,
  encryptRSA,
} from "../encryption";
import { Chats } from "../idb";
import { identity, Chat, chats, currentChat } from "../signals";

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
  if (!identity.value) {
    throw new Error("no identity");
  }
  const chat: Chat = {
    publicKey,
    serializedPublicKey,
    displayName,
    symmetricKey,
  };
  await Chats.put(chat);
  chats.value = await Chats.getAll();
  const serializedSymmetricKey = await exportSymmetricKey(symmetricKey);
  const data: z.infer<typeof createChatSchema> = {
    type: "CHAT",
    displayName: identity.value.displayName,
    symmetricKey: serializedSymmetricKey,
  };
  const ciphertext = await encryptRSA(publicKey, data);
  await send(serializedPublicKey, {
    publicKey: identity.value.serializedPublicKey,
    ciphertext,
  });
  if (!currentChat.value) {
    currentChat.value = chat;
  }
};
