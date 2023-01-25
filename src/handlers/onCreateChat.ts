import { z } from "zod";
import { createChatSchema } from ".";
import { importPublicKey, importSymmetricKey } from "../encryption";
import { Chats } from "../idb";
import { Chat, chats } from "../signals";

export const onCreateChat = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createChatSchema>
) => {
  const chat: Chat = {
    publicKey: await importPublicKey(serializedPublicKey),
    serializedPublicKey,
    displayName: payload.displayName,
    symmetricKey: await importSymmetricKey(payload.symmetricKey),
  };
  await Chats.put(chat);
  chats.value = await Chats.getAll();
};
