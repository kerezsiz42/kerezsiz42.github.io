import { z } from "zod";
import { createKeySchema, sendWithRSA } from ".";
import { exportSymmetricKey, generateSymmetricKey } from "../encryption";
import { KeyRecords } from "../idb";
import { KeyRecord } from "../types";

export const createKey = async (serializedPublicKey: string) => {
  const symmetricKey = await generateSymmetricKey();
  const entryId = crypto.randomUUID();
  const keyRecord: KeyRecord = {
    entryId,
    serializedPublicKey,
    symmetricKey,
  };
  await KeyRecords.put(keyRecord);
  const createKeyPayload: z.infer<typeof createKeySchema> = {
    type: "KEY",
    entryId,
    symmetricKey: await exportSymmetricKey(symmetricKey),
  };
  await sendWithRSA(serializedPublicKey, createKeyPayload);
};
