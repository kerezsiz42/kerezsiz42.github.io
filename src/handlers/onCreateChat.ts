import { z } from "zod";
import { createChatSchema, sendWithAES } from ".";
import { Chats } from "../idb";
import { Chat } from "../types";

export const onCreateChat = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createChatSchema>,
  displayName: string,
  avatar?: string
) => {
  const exisitingChat = await Chats.get(serializedPublicKey);
  if (exisitingChat && exisitingChat.entryId === payload.entryId) {
    return;
  }
  const chat: Chat = {
    serializedPublicKey,
    displayName: payload.displayName,
    entryId: payload.entryId,
  };
  await Chats.put(chat);
  const responsePayload: z.infer<typeof createChatSchema> = {
    type: payload.type,
    entryId: payload.entryId,
    displayName,
    avatar,
  };
  await sendWithAES(serializedPublicKey, responsePayload);
};
