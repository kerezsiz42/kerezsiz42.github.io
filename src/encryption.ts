export const stringToBytes = (str: string) => {
  const binary = window.atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const bytesToString = (bytes: Uint8Array) => {
  return window.btoa(String.fromCharCode(...bytes));
};

const ASYMMETRIC_ALOGRITHM = {
  name: "RSA-OAEP",
  hash: { name: "SHA-256" },
};

const SYMMETRIC_ALGORITHM = {
  name: "AES-GCM",
  length: 256,
};

export const exportSymmetricKey = async (
  symmetricKey: CryptoKey
): Promise<string> => {
  return bytesToString(
    new Uint8Array(await crypto.subtle.exportKey("raw", symmetricKey))
  );
};

export const exportPublicKey = async (
  publicKey: CryptoKey
): Promise<string> => {
  return bytesToString(
    new Uint8Array(await crypto.subtle.exportKey("spki", publicKey))
  );
};

export const exportPrivateKey = async (
  privateKey: CryptoKey
): Promise<string> => {
  return bytesToString(
    new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey))
  );
};

export const importSymmetricKey = (
  symmetricKey: string
): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    "raw",
    stringToBytes(symmetricKey),
    SYMMETRIC_ALGORITHM,
    true,
    ["encrypt", "decrypt"]
  );
};

export const importPublicKey = (publicKey: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    "spki",
    stringToBytes(publicKey),
    ASYMMETRIC_ALOGRITHM,
    true,
    ["encrypt"]
  );
};

export const importPrivateKey = (privateKey: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    "pkcs8",
    stringToBytes(privateKey),
    ASYMMETRIC_ALOGRITHM,
    true,
    ["decrypt"]
  );
};

export const encryptAES = async (
  symmetricKey: CryptoKey,
  data: any
): Promise<{ iv: string; ciphertext: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const arrayBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    symmetricKey,
    new TextEncoder().encode(JSON.stringify(data))
  );
  return {
    iv: bytesToString(iv),
    ciphertext: bytesToString(new Uint8Array(arrayBuffer)),
  };
};

export const decryptAES = async (
  symmetricKey: CryptoKey,
  iv: string,
  ciphertext: string
): Promise<any> => {
  const arrayBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: stringToBytes(iv) },
    symmetricKey,
    stringToBytes(ciphertext)
  );
  return JSON.parse(String.fromCharCode(...new Uint8Array(arrayBuffer)));
};

export const encryptRSA = async (
  publicKey: CryptoKey,
  data: any
): Promise<string> => {
  const arrayBuffer = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    new TextEncoder().encode(JSON.stringify(data))
  );
  return bytesToString(new Uint8Array(arrayBuffer));
};

export const decryptRSA = async (
  privateKey: CryptoKey,
  ciphertext: string
): Promise<any> => {
  const arrayBuffer = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    stringToBytes(ciphertext)
  );
  return JSON.parse(String.fromCharCode(...new Uint8Array(arrayBuffer)));
};

export const generateSymmetricKey = () => {
  return crypto.subtle.generateKey(SYMMETRIC_ALGORITHM, true, [
    "encrypt",
    "decrypt",
  ]);
};

export const generateKeyPair = () => {
  return crypto.subtle.generateKey(
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
