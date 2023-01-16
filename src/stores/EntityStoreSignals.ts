import { signal } from "@preact/signals";
import { openDB, DBSchema } from "idb";

type Entity = {
  symmetricKey: CryptoKey;
  publicKey: CryptoKey;
  displayName: string;
  avatar: string;
};

interface NotiDB extends DBSchema {
  entities: {
    key: string;
    value: Entity;
    indexes: {};
  };
}

const db = await openDB<NotiDB>("noti-db", 1, {
  upgrade(db) {
    db.createObjectStore("entities");
  },
});

export const selectedConversation = signal<Entity | undefined>(undefined);
export const conversations = signal<Entity[]>([]);

export const createConversation = async () => {
  const symmetricKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};
