import { signal, effect } from "@preact/signals";
import { IDENTITY_STORAGE_NAME, serializeIdentity } from "../functions";

export type Identity = {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  serializedPublicKey: string;
  displayName: string;
  avatar?: string;
};

export const identity = signal<Identity | undefined>(undefined);

effect(async () => {
  if (!identity.value) {
    return;
  }
  const serializedIdentity = await serializeIdentity(identity.value);
  localStorage.setItem(IDENTITY_STORAGE_NAME, serializedIdentity);
});
