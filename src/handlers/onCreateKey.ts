import { z } from "zod";
import { createKeySchema, sendWithRSA } from ".";
import { importSymmetricKey } from "../encryption";
import { KeyRecords } from "../idb";
import { KeyRecord } from "../types";

export const onCreateKey = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createKeySchema>
) => {
  const existingKeyRecord = await KeyRecords.get(serializedPublicKey);
  if (existingKeyRecord && existingKeyRecord.entryId === payload.entryId) {
    return;
  }
  const symmetricKey = await importSymmetricKey(payload.symmetricKey);
  const newKeyRecord: KeyRecord = {
    entryId: payload.entryId,
    serializedPublicKey,
    symmetricKey,
  };
  await KeyRecords.put(newKeyRecord);
  const responsePayload: z.infer<typeof createKeySchema> = {
    type: "KEY",
    entryId: payload.entryId,
    symmetricKey: payload.symmetricKey,
  };
  await sendWithRSA(serializedPublicKey, responsePayload);
};
