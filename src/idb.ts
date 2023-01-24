import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Chat, Key, Message } from "./signals";

interface NotiDB extends DBSchema {
  chats: {
    key: string;
    value: Chat;
    indexes: {};
  };
  messages: {
    key: string;
    value: Message;
    indexes: {
      timestamp: number;
    };
  };
  keys: {
    key: string;
    value: Key;
  };
}

let idb: IDBPDatabase<NotiDB> | undefined = undefined;

export const initDatabase = () => {
  return openDB<NotiDB>("noti-db", 1, {
    upgrade(db) {
      db.createObjectStore("chats", { keyPath: "serializedPublicKey" });
      db.createObjectStore("messages", { keyPath: "sender" }).createIndex(
        "timestamp",
        "timestamp"
      );
      db.createObjectStore("keys", { keyPath: "serializedPublicKey" });
    },
  });
};

export class Keys {
  public static async put(
    serializedPublicKey: string,
    symmetricKey: CryptoKey
  ) {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.put("keys", { serializedPublicKey, symmetricKey });
  }

  public static async get(serializedPublicKey: string) {
    if (!idb) {
      idb = await initDatabase();
    }
    const key = await idb.get("keys", serializedPublicKey);
    if (!key) {
      return undefined;
    }
    return key.symmetricKey;
  }
}

export class Chats {
  public static async put(chat: Chat) {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.put("chats", chat);
  }

  public static async get(serializedPublicKey: string) {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.get("chats", serializedPublicKey);
  }

  public static async list() {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.getAll("chats");
  }
}

export const getMessagesBySender = async (sender: string) => {
  if (!idb) {
    idb = await initDatabase();
  }
  return await idb.getAll("messages", sender);
};
