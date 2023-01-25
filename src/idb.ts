import { openDB, DBSchema, IDBPDatabase, deleteDB } from "idb";
import { Chat, Message } from "./signals";

interface NotiDB extends DBSchema {
  chats: {
    key: string;
    value: Chat;
  };
  messages: {
    key: string;
    value: Message;
    indexes: {
      sender: string;
    };
  };
}

let idb: IDBPDatabase<NotiDB> | undefined = undefined;

export const initDatabase = () => {
  return openDB<NotiDB>("noti-db", 1, {
    upgrade(db) {
      db.createObjectStore("chats", { keyPath: "serializedPublicKey" });
      db.createObjectStore("messages", { keyPath: "id" }).createIndex(
        "sender",
        "sender"
      );
    },
  });
};

export const clearDatabase = async () => {
  if (idb) {
    idb.close();
    idb = undefined;
  }
  await deleteDB("noti-db");
};

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

  public static async getAll() {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.getAll("chats");
  }
}

export class Messages {
  public static async getBySender(sender: string) {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.getAllFromIndex("messages", "sender", sender);
  }

  public static async put(message: Message) {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.put("messages", message);
  }

  public static async get(id: string) {
    if (!idb) {
      idb = await initDatabase();
    }
    return await idb.get("messages", id);
  }
}

// export class Keys {
//   public static async put(
//     serializedPublicKey: string,
//     symmetricKey: CryptoKey
//   ) {
//     if (!idb) {
//       idb = await initDatabase();
//     }
//     return await idb.put("keys", { serializedPublicKey, symmetricKey });
//   }

//   public static async get(serializedPublicKey: string) {
//     if (!idb) {
//       idb = await initDatabase();
//     }
//     const key = await idb.get("keys", serializedPublicKey);
//     if (!key) {
//       return undefined;
//     }
//     return key.symmetricKey;
//   }
// }
