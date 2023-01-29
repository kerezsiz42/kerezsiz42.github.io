import { z } from "zod";
import { createKeySchema, sendWithRSA } from ".";
import { AwaitableEvents } from "../AwaitableEvents";
import { exportSymmetricKey, generateSymmetricKey } from "../encryption";
import { KeyRecord } from "../types";

export const keyRecordAwaiter = new AwaitableEvents<KeyRecord>();

export const createKey = async (serializedPublicKey: string) => {
  const symmetricKey = await generateSymmetricKey();
  const entryId = crypto.randomUUID();
  const createKeyPayload: z.infer<typeof createKeySchema> = {
    type: "KEY",
    entryId,
    symmetricKey: await exportSymmetricKey(symmetricKey),
  };
  await sendWithRSA(serializedPublicKey, createKeyPayload);
  const keyRecord = await keyRecordAwaiter.waitFor(entryId, 10_000);
  if (!keyRecord) {
    throw new Error("Failed to get symmetric key from peer.");
  }
  return keyRecord;
};
