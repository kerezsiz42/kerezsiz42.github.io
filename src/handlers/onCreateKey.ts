import { z } from "zod";
import { createKeySchema, sendWithRSA } from ".";
import { importSymmetricKey } from "../encryption";
import { KeyRecords } from "../idb";
import { KeyRecord } from "../types";
import { keyRecordAwaiter } from "./createKey";

export const onCreateKey = async (
  serializedPublicKey: string,
  payload: z.infer<typeof createKeySchema>
) => {
  const existingKeyRecord = await KeyRecords.get(serializedPublicKey);
  if (existingKeyRecord && existingKeyRecord.entryId === payload.entryId) {
    return;
  }
  const symmetricKey = await importSymmetricKey(payload.symmetricKey);
  const keyRecord: KeyRecord = {
    entryId: payload.entryId,
    serializedPublicKey,
    symmetricKey,
  };
  await KeyRecords.put(keyRecord);
  keyRecordAwaiter.dispatch(payload.entryId, keyRecord);
  const createKeyPayload: z.infer<typeof createKeySchema> = {
    type: payload.type,
    entryId: payload.entryId,
    symmetricKey: payload.symmetricKey,
  };
  await sendWithRSA(serializedPublicKey, createKeyPayload);
};
