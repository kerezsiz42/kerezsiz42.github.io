import { signal, effect } from "@preact/signals";
import { z } from "zod";
import {
  exportPrivateKey,
  importPrivateKey,
  importPublicKey,
} from "./encryption";
import { Chats, clearDatabase } from "./idb";
import { Identity, Chat, KeyRecord, Message } from "./types";

export const loading = signal<boolean>(true);
export const connected = signal(false);
export const identity = signal<Identity | undefined>(undefined);
export const currentChat = signal<Chat | undefined>(undefined);
export const currentKeyRecord = signal<KeyRecord | undefined>(undefined);
export const chats = signal<Chat[]>([]);
export const messages = signal<Message[]>([]);

const IDENTITY_STORAGE_NAME = "identity";

effect(async () => {
  if (!identity.value) {
    chats.value = [];
    return;
  }
  localStorage.setItem(
    IDENTITY_STORAGE_NAME,
    await exportIdentity(identity.value)
  );
  chats.value = await Chats.getAll();
});

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
  serializedPublicKey,
  privateKey,
  displayName,
  avatar,
}: Identity): Promise<string> => {
  return JSON.stringify({
    publicKey: serializedPublicKey,
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
    serializedPublicKey: parsing.data.publicKey,
    privateKey: await importPrivateKey(parsing.data.privateKey),
    displayName: parsing.data.displayName,
    avatar: parsing.data.avatar,
  };
};

export const getIdentity = () =>
  importIdentity(localStorage.getItem(IDENTITY_STORAGE_NAME) || '""');

export const deleteIdentity = async () => {
  identity.value = undefined;
  localStorage.removeItem(IDENTITY_STORAGE_NAME);
  await clearDatabase();
  chats.value = await Chats.getAll();
};

export const downloadIdentity = async () => {
  if (!identity.value) {
    return;
  }
  const a = document.createElement("a");
  a.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(
      await exportIdentity(identity.value)
    )}`
  );
  a.setAttribute("download", `${crypto.randomUUID()}.json`);
  a.click();
};
