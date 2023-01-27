import { z } from "zod";
import { createMessageSchema, sendWithAES } from ".";
import { Messages } from "../idb";
import { Message } from "../types";

export const createMessage = async (
  serializedPublicKey: string,
  content: string,
  ownSerializedPublicKey: string
) => {
  const timestamp = Date.now();
  const entryId = crypto.randomUUID();
  const message: Message = {
    sender: ownSerializedPublicKey,
    content,
    timestamp,
    entryId,
  };
  await Messages.put(message);
  const createMessagePayload: z.infer<typeof createMessageSchema> = {
    type: "MESSAGE",
    content,
    timestamp,
    entryId,
  };
  await sendWithAES(serializedPublicKey, createMessagePayload);
};
