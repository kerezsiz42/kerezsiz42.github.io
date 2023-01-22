import { signal, effect } from "@preact/signals";
import { z } from "zod";

export const ASYMMETRIC_ALOGRITHM = {
  name: "RSA-OAEP",
  hash: { name: "SHA-256" },
};

export const SYMMETRIC_ALGORITHM = {
  name: "AES-GCM",
  length: 256,
};

export type Chat = {
  symmetricKey: CryptoKey;
  publicKey: CryptoKey;
  serializedPublicKey: string;
  displayName: string;
  avatar?: string;
};

export const messageSchema = z.object({
  content: z.string(),
  sender: z.string(),
  recipient: z.string(),
  timestamp: z.number(),
});

export type Identity = {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  displayName: string;
  avatar?: string;
};

export const identity = signal<Identity | undefined>(undefined);
export const loading = signal<boolean>(true);
export const connected = signal(false);
export const selectedChat = signal<Chat | undefined>(undefined);
export const messages = signal<z.infer<typeof messageSchema>[]>([]);

export const IDENTITY_STORAGE_NAME = "identity";

export const importIdentityFromFile = (
  fileList: FileList
): Promise<Identity | undefined> => {
  return new Promise((resolve) => {
    if (fileList.length === 0) {
      return resolve(undefined);
    }
    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      const data = await deserializeIdentity(fileReader.result as string);
      if (!data) {
        return resolve(undefined);
      }
      return resolve(data);
    };
    fileReader.readAsText(fileList[0]);
  });
};

export const serializeIdentity = async ({
  publicKey,
  privateKey,
  displayName,
}: Identity): Promise<string> => {
  return JSON.stringify({
    publicKey: await crypto.subtle.exportKey("jwk", publicKey),
    privateKey: await crypto.subtle.exportKey("jwk", privateKey),
    displayName,
  });
};

export const deserializeIdentity = async (
  identityString: string
): Promise<Identity | undefined> => {
  const parsing = z
    .object({
      publicKey: z.any(),
      privateKey: z.any(),
      displayName: z.string(),
    })
    .safeParse(JSON.parse(identityString));
  if (!parsing.success) {
    return undefined;
  }
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    parsing.data.publicKey,
    ASYMMETRIC_ALOGRITHM,
    true,
    ["encrypt"]
  );
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    parsing.data.privateKey,
    ASYMMETRIC_ALOGRITHM,
    true,
    ["decrypt"]
  );
  return {
    publicKey,
    privateKey,
    displayName: parsing.data.displayName,
  };
};

export const loadIdentity = () =>
  deserializeIdentity(localStorage.getItem(IDENTITY_STORAGE_NAME) || '""');

effect(async () => {
  if (!identity.value) {
    return;
  }
  const serializedIdentity = await serializeIdentity(identity.value);
  localStorage.setItem(IDENTITY_STORAGE_NAME, serializedIdentity);
});
