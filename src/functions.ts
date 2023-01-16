import { z } from "zod";
import { Identity } from "./stores/IdentityStoreSignals";

const ALGORITHM = {
  name: "RSA-OAEP",
  hash: { name: "SHA-256" },
};

export const IDENTITY_STORAGE_NAME = "identity";

export const publicKeyToBase64 = async (
  publicKey: CryptoKey
): Promise<string> => {
  const arrayBuffer = await crypto.subtle.exportKey("spki", publicKey);
  return window.btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
};

export const base64ToPublicKey = async (
  publicKey: string
): Promise<CryptoKey> => {
  const bytes = window.atob(publicKey);
  const byteArray = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    byteArray[i] = bytes.charCodeAt(i);
  }
  return await crypto.subtle.importKey("spki", byteArray, ALGORITHM, true, [
    "encrypt",
  ]);
};

export const importIdentity = (
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
  username,
}: Identity): Promise<string> => {
  return JSON.stringify({
    publicKey: await crypto.subtle.exportKey("jwk", publicKey),
    privateKey: await crypto.subtle.exportKey("jwk", privateKey),
    username,
  });
};

export const deserializeIdentity = async (
  identityString: string
): Promise<Identity | undefined> => {
  const parsing = z
    .object({ publicKey: z.any(), privateKey: z.any(), username: z.string() })
    .safeParse(JSON.parse(identityString));
  if (!parsing.success) {
    return undefined;
  }
  return {
    publicKey: await crypto.subtle.importKey(
      "jwk",
      parsing.data.publicKey,
      ALGORITHM,
      true,
      ["encrypt"]
    ),
    privateKey: await crypto.subtle.importKey(
      "jwk",
      parsing.data.privateKey,
      ALGORITHM,
      true,
      ["decrypt"]
    ),
    username: parsing.data.username,
  };
};

export const generateIdentity = async () => {
  return await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const loadIdentity = () =>
  deserializeIdentity(localStorage.getItem(IDENTITY_STORAGE_NAME) || '""');
