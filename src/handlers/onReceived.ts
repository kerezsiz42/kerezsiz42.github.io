import { z } from "zod";
import { receiveMessageSchema } from ".";
import { Messages } from "../idb";

export const onReceived = async (
  payload: z.infer<typeof receiveMessageSchema>
) => {
  const message = await Messages.get(payload.id);
  if (!message) {
    return;
  }
  message.synchronized = true;
  await Messages.put(message);
};
