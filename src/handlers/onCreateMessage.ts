import { z } from "zod";
import { createMessageSchema, receiveMessageSchema, send } from ".";
import { encryptAES } from "../encryption";
import { Chats, Messages } from "../idb";
import { identity, Message } from "../signals";

export const onCreateMessage = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createMessageSchema>
) => {
  if (!identity.value) {
    throw new Error("no identity");
  }
  const chat = await Chats.get(serializedPublicKey);
  if (!chat || !chat.symmetricKey) {
    return;
  }
  const message: Message = {
    sender: serializedPublicKey,
    content: payload.content,
    timestamp: payload.timestamp,
    id: payload.id,
    synchronized: true,
  };
  await Messages.put(message);
  const data: z.infer<typeof receiveMessageSchema> = {
    type: "RECEIVED",
    id: payload.id,
  };
  const { iv, ciphertext } = await encryptAES(chat.symmetricKey, data);
  await send(serializedPublicKey, {
    iv,
    publicKey: identity.value.serializedPublicKey,
    ciphertext,
  });
};
