export type Chat = {
  entryId: string;
  serializedPublicKey: string;
  displayName: string;
  avatar?: string;
};

export type Message = {
  entryId: string;
  content: string;
  sender: string;
  timestamp: number;
};

export type Identity = {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  serializedPublicKey: string;
  displayName: string;
  avatar?: string;
};

export type KeyRecord = {
  entryId: string;
  serializedPublicKey: string;
  symmetricKey: CryptoKey;
};
