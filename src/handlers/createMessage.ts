import { z } from "zod";
import { createMessageSchema, send } from ".";
import { encryptAES } from "../encryption";
import { Messages, Chats } from "../idb";
import { identity, Message } from "../signals";

export const createMessage = async (
  serializedPublicKey: string,
  content: string
) => {
  if (!identity.value) {
    throw new Error("no identity");
  }
  const message: Message = {
    sender: identity.value.serializedPublicKey,
    content,
    timestamp: Date.now(),
    id: crypto.randomUUID(),
    synchronized: false,
  };
  await Messages.put(message);
  const data: z.infer<typeof createMessageSchema> = {
    type: "MESSAGE",
    content: message.content,
    timestamp: message.timestamp,
    id: message.id,
  };
  const chat = await Chats.get(serializedPublicKey);
  if (!chat || !chat.symmetricKey) {
    return;
  }
  const { iv, ciphertext } = await encryptAES(chat.symmetricKey, data);
  await send(serializedPublicKey, {
    iv,
    publicKey: identity.value.serializedPublicKey,
    ciphertext,
  });
};
