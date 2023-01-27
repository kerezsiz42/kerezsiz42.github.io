import { z } from "zod";
import { createChatSchema, sendWithAES } from ".";
import { Chats } from "../idb";
import { Chat } from "../types";

export const createChat = async (
  serializedPublicKey: string,
  displayName: string,
  avatar?: string
) => {
  const entryId = crypto.randomUUID();
  const chat: Chat = {
    entryId,
    serializedPublicKey,
    displayName,
  };
  await Chats.put(chat);
  const createChatPayload: z.infer<typeof createChatSchema> = {
    type: "CHAT",
    entryId,
    displayName,
    avatar,
  };
  await sendWithAES(serializedPublicKey, createChatPayload);
};
