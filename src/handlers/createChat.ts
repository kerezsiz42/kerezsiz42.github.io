import { z } from "zod";
import { createChatSchema, sendWithAES } from ".";
import { AwaitableEvents } from "../AwaitableEvents";
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
    displayName: encodeURIComponent(displayName),
    avatar,
  };
  await sendWithAES(serializedPublicKey, createChatPayload);
  return await chatAwaiter.waitFor(entryId, 10_000);
};
