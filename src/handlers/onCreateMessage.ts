import { z } from "zod";
import { createMessageSchema, sendWithAES } from ".";
import { Messages } from "../idb";
import { Message } from "../types";

export const onCreateMessage = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createMessageSchema>
) => {
  const existingMessage = await Messages.get(serializedPublicKey);
  if (existingMessage && existingMessage.entryId === payload.entryId) {
    return;
  }
  const message: Message = {
    sender: serializedPublicKey,
    content: payload.content,
    timestamp: payload.timestamp,
    entryId: payload.entryId,
  };
  await Messages.put(message);
  const createMessagePayload: z.infer<typeof createMessageSchema> = {
    type: payload.type,
    entryId: payload.entryId,
    content: payload.content,
    timestamp: payload.timestamp,
  };
  await sendWithAES(serializedPublicKey, createMessagePayload);
};
