import { z } from "zod";
import { createChatSchema, sendWithAES } from ".";
import { AwaitableEvents } from "../AwaitableEvents";
import { Chats } from "../idb";
import { Chat } from "../types";

export const chatAwaiter = new AwaitableEvents<Chat>();

export const createChat = async (
  serializedPublicKey: string,
  displayName: string,
  avatar?: string
) => {
  const entryId = crypto.randomUUID();
  const createChatPayload: z.infer<typeof createChatSchema> = {
    type: "CHAT",
    entryId,
    displayName,
    avatar,
  };
  await sendWithAES(serializedPublicKey, createChatPayload);
  const chat = await chatAwaiter.waitFor(entryId, 10_000);
  if (!chat) {
    throw new Error("Failed to create new chat with peer.");
  }
  return chat;
};
