import { openDB, DBSchema, IDBPDatabase } from "idb";
import { z } from "zod";
import { Chat, messageSchema } from "./signals";

interface NotiDB extends DBSchema {
  chats: {
    key: string;
    value: Chat;
    indexes: {};
  };
  messages: {
    key: string;
    value: z.infer<typeof messageSchema>;
    indexes: {
      timestamp: number;
    };
  };
}

export let idb: IDBPDatabase<NotiDB> | undefined = undefined;

export const initDatabase = async () => {
  return await openDB<NotiDB>("noti-db", 1, {
    upgrade(db) {
      db.createObjectStore("chats", { keyPath: "serializedPublicKey" });
      db.createObjectStore("messages", { keyPath: "sender" }).createIndex(
        "timestamp",
        "timestamp"
      );
    },
  });
};

export const addChat = async (chat: Chat) => {
  if (!idb) {
    throw new Error("Idb is undefined");
  }
  return await idb.add("chats", chat, chat.serializedPublicKey);
};

export const getChats = async () => {
  if (!idb) {
    throw new Error("Idb is undefined");
  }
  return await idb.getAll("chats");
};

export const getMessagesBySender = async (sender: string) => {
  if (!idb) {
    throw new Error("Idb is undefined");
  }
  return await idb.getAll("messages", sender);
};
