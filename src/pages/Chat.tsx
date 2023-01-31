import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Link, useLocation } from "wouter-preact";
import { Avatar } from "../components/Avatar";
import { Layout } from "../components/Layout";
import { createChat } from "../handlers/createChat";
import { createKey } from "../handlers/createKey";
import { createMessage } from "../handlers/createMessage";
import { Chats, KeyRecords, Messages } from "../idb";
import { currentChat, messages } from "../signals";
import { Identity, KeyRecord } from "../types";

type ChatPageProps = {
  publicKey: string;
  identity: Identity;
};

export const ChatPage = ({ publicKey, identity }: ChatPageProps) => {
  const [_, setLocation] = useLocation();
  const text = useSignal("");

  useEffect(() => {
    if (publicKey === identity.serializedPublicKey) {
      setLocation("/");
      return;
    }
    const fn = async () => {
      let keyRecord: KeyRecord | undefined;
      while (!keyRecord) {
        keyRecord =
          (await KeyRecords.get(publicKey)) || (await createKey(publicKey));
      }
      currentChat.value = await Chats.get(publicKey);
      while (!currentChat.value) {
        currentChat.value = await createChat(
          publicKey,
          identity.displayName,
          identity.avatar
        );
      }
      messages.value = await Messages.getAll(publicKey);
    };
    fn();
  }, [publicKey]);

  return (
    <Layout>
      <div className="flex items-center justify-between p-3 border-b border-gray-500 w-full">
        <div className="flex items-center">
          <Avatar
            alt={currentChat.value?.displayName || "User"}
            src={currentChat.value?.avatar}
          />
          <h1 className="pl-4 font-bold">
            {currentChat.value?.displayName || "Loading..."}
          </h1>
        </div>
        <div className="flex items-center">
          {/* <button type="button">
            <i className="fa-solid fa-phone text-2xl p-3 cursor-pointer"></i>
          </button> */}
          <Link href="/">
            <i className="fa-solid fa-chevron-right text-3xl p-3 cursor-pointer"></i>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col-reverse overflow-auto w-full">
        {messages.value.map((m) => (
          <div
            className={`${
              publicKey === m.sender ? "self-start" : "self-end"
            } flex items-center m-2 max-w-[80%]`}
          >
            {publicKey === m.sender ? (
              <Avatar
                alt={currentChat.value?.displayName || "User"}
                src={currentChat.value?.avatar}
                size={30}
              />
            ) : null}
            <span
              className={`rounded-2xl p-2 ml-2 ${
                publicKey === m.sender
                  ? "bg-slate-600"
                  : m.receivedAt
                  ? "bg-blue-500"
                  : "bg-orange-600"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="border-gray-500 flex items-center border-t py-4 px-2 w-full">
        <textarea
          className="bg-black border border-white focus:outline-none w-full px-3 py-2 rounded-[2rem] resize-none overflow-hidden"
          placeholder="Type your message..."
          autofocus
          rows={1}
          value={text.value}
          onChange={({ target }) => {
            if (target instanceof HTMLTextAreaElement) {
              text.value = target.value;
            }
          }}
        ></textarea>
        <button
          type="button"
          onClick={async () => {
            const trimmed = text.value.trim();
            if (trimmed === "") {
              return;
            }
            await createMessage(
              publicKey,
              trimmed,
              identity.serializedPublicKey
            );
            text.value = "";
          }}
        >
          <i className="fa-solid fa-paper-plane py-2 text-2xl pr-3 pl-6 cursor-pointer focus:outline-none"></i>
        </button>
      </div>
    </Layout>
  );
};
