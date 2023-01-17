import { signal } from "@preact/signals";
import { openDB, DBSchema, IDBPDatabase } from "idb";

const SYMMETRIC_ALGORITHM = {
  name: "AES-GCM",
  length: 256,
};

export type Entity = {
  symmetricKey: CryptoKey;
  publicKey: CryptoKey;
  serializedPublicKey: string;
  displayName: string;
  avatar?: string;
};

interface NotiDB extends DBSchema {
  entities: {
    key: string;
    value: Entity;
    indexes: {};
  };
}

export let idb: IDBPDatabase<NotiDB> | undefined = undefined;

export const initDatabase = async () => {
  return await openDB<NotiDB>("noti-db", 1, {
    upgrade(db) {
      db.createObjectStore("entities", { keyPath: "serializedPublicKey" });
    },
  });
};

export const selectedEntity = signal<Entity | undefined>(undefined);

export const generateSymmetricKey = async () => {
  return await crypto.subtle.generateKey(SYMMETRIC_ALGORITHM, true, [
    "encrypt",
    "decrypt",
  ]);
};

export const jwkToSymmetricKey = async (jwk: string) => {
  return await crypto.subtle.importKey(
    "jwk",
    JSON.parse(jwk),
    SYMMETRIC_ALGORITHM,
    true,
    []
  );
};

export const symmetricKeyToJwk = async (symmetricKey: CryptoKey) => {
  return JSON.stringify(await crypto.subtle.exportKey("jwk", symmetricKey));
};

export const addEntity = async (entity: Entity) => {
  if (!idb) {
    return undefined;
  }
  return await idb.add("entities", entity, entity.serializedPublicKey);
};

export const listEntities = async () => {
  if (!idb) {
    return [];
  }
  return await idb.getAll("entities");
};
