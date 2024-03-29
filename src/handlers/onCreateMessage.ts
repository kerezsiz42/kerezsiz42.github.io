import { z } from "zod";
import { createMessageSchema, sendWithAES } from ".";
import { Chats, Messages } from "../idb";
import { currentChat, messages } from "../signals";
import { Message } from "../types";

export const onCreateMessage = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createMessageSchema>,
  ownSerializedPublicKey: string
) => {
  const existingMessage = await Messages.get(payload.entryId);
  if (existingMessage) {
    existingMessage.receivedAt = payload.receivedAt;
    await Messages.put(existingMessage);
    if (currentChat.value?.serializedPublicKey === serializedPublicKey) {
      messages.value = await Messages.getAll(serializedPublicKey);
    }
    return;
  }
  const receivedAt = Date.now();
  const message: Message = {
    sender: serializedPublicKey,
    recipient: ownSerializedPublicKey,
    content: decodeURIComponent(payload.content),
    createdAt: payload.createdAt,
    entryId: payload.entryId,
    receivedAt,
  };
  await Messages.put(message);
  const chat = await Chats.get(message.sender);
  if (
    chat &&
    (currentChat.value?.serializedPublicKey !== message.sender ||
      document.hidden)
  ) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(
      `Noti message from ${chat.displayName}:`,
      {
        body: message.content,
        icon: `https://ui-avatars.com/api/?name=${chat.displayName}&rounded=true&format=svg&background=random`,
        data: `${location.protocol}//${location.host}/chat/${encodeURIComponent(
          message.sender
        )}`,
        vibrate: [50],
      }
    );
  }

  if (currentChat.value?.serializedPublicKey === serializedPublicKey) {
    messages.value = await Messages.getAll(serializedPublicKey);
  }
  const createMessagePayload: z.infer<typeof createMessageSchema> = {
    type: payload.type,
    entryId: payload.entryId,
    content: payload.content,
    createdAt: payload.createdAt,
    receivedAt,
  };
  await sendWithAES(serializedPublicKey, createMessagePayload);
};
