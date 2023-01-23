import { signal, effect } from "@preact/signals";
import { z } from "zod";
import {
  exportPrivateKey,
  exportPublicKey,
  importPrivateKey,
  importPublicKey,
} from "./encryption";

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

export const loadIdentityFromFile = (
  fileList: FileList
): Promise<Identity | undefined> => {
  return new Promise((resolve) => {
    if (fileList.length === 0) {
      return resolve(undefined);
    }
    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      const data = await importIdentity(fileReader.result as string);
      if (!data) {
        return resolve(undefined);
      }
      return resolve(data);
    };
    fileReader.readAsText(fileList[0]);
  });
};

export const exportIdentity = async ({
  publicKey,
  privateKey,
  displayName,
  avatar,
}: Identity): Promise<string> => {
  return JSON.stringify({
    publicKey: await exportPublicKey(publicKey),
    privateKey: await exportPrivateKey(privateKey),
    displayName,
    avatar,
  });
};

export const importIdentity = async (
  identityString: string
): Promise<Identity | undefined> => {
  const parsing = z
    .object({
      publicKey: z.string(),
      privateKey: z.string(),
      displayName: z.string(),
      avatar: z.string().optional(),
    })
    .safeParse(JSON.parse(identityString));
  if (!parsing.success) {
    return undefined;
  }
  return {
    publicKey: await importPublicKey(parsing.data.publicKey),
    privateKey: await importPrivateKey(parsing.data.privateKey),
    displayName: parsing.data.displayName,
  };
};

export const getIdentity = () =>
  importIdentity(localStorage.getItem(IDENTITY_STORAGE_NAME) || '""');

effect(async () => {
  if (!identity.value) {
    return;
  }
  localStorage.setItem(
    IDENTITY_STORAGE_NAME,
    await exportIdentity(identity.value)
  );
});
