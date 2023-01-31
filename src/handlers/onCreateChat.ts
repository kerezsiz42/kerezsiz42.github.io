import { z } from "zod";
import { createChatSchema, sendWithAES } from ".";
import { Chats } from "../idb";
import { chats } from "../signals";
import { Chat } from "../types";
import { chatAwaiter } from "./createChat";

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
    displayName: decodeURIComponent(payload.displayName),
    entryId: payload.entryId,
  };
  await Chats.put(chat);
  chats.value = [chat, ...chats.value];
  chatAwaiter.dispatch(payload.entryId, chat);
  const responsePayload: z.infer<typeof createChatSchema> = {
    type: payload.type,
    entryId: payload.entryId,
    displayName: encodeURIComponent(displayName),
    avatar,
  };
  await sendWithAES(serializedPublicKey, responsePayload);
};
