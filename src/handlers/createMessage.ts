import { z } from "zod";
import { createMessageSchema, sendWithAES } from ".";
import { Messages } from "../idb";
import { currentChat, messages } from "../signals";
import { Message } from "../types";

export const createMessage = async (
  serializedPublicKey: string,
  content: string,
  ownSerializedPublicKey: string
) => {
  const createdAt = Date.now();
  const entryId = crypto.randomUUID();
  const message: Message = {
    sender: ownSerializedPublicKey,
    recipient: serializedPublicKey,
    content,
    createdAt,
    entryId,
  };
  await Messages.put(message);
  if (currentChat.value?.serializedPublicKey === serializedPublicKey) {
    messages.value = await Messages.getAll(serializedPublicKey);
  }
  const createMessagePayload: z.infer<typeof createMessageSchema> = {
    type: "MESSAGE",
    content,
    createdAt,
    entryId,
  };
  await sendWithAES(serializedPublicKey, createMessagePayload);
};
