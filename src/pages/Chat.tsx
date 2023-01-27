import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Link, useLocation } from "wouter-preact";
import { Avatar } from "../components/Avatar";
import { Layout } from "../components/Layout";
import { createChat } from "../handlers/createChat";
import { createMessage } from "../handlers/createMessage";
import { Chats, Messages } from "../idb";
import { currentChat } from "../signals";
import { Identity, Message } from "../types";

type ChatPageProps = {
  publicKey: string;
  identity: Identity;
};

export const ChatPage = ({ publicKey, identity }: ChatPageProps) => {
  const [_, setLocation] = useLocation();
  const messages = useSignal<Message[]>([]);
  const text = useSignal("");

  useEffect(() => {
    if (publicKey === identity.serializedPublicKey) {
      setLocation("/");
      return;
    }
    const fn = async () => {
      const foundChat = await Chats.get(publicKey);
      if (!foundChat) {
        await createChat(publicKey, identity.displayName, identity.avatar);
        return;
      }
      currentChat.value = foundChat;
      messages.value = await Messages.getBySender(publicKey);
    };
    fn();
  }, []);

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
      <div className="flex-1 flex flex-col">
        {messages.value.map((message) => (
          <span className="bg-blue-500 rounded-2xl p-2 m-2">
            {message.content}
          </span>
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
            if (text.value === "") {
              return;
            }
            await createMessage(
              publicKey,
              text.value,
              identity.serializedPublicKey
            );
            text.value = "";
          }}
        >
          <i className="fa-solid fa-paper-plane py-2 text-2xl pr-3 pl-6 cursor-pointer outline-none"></i>
        </button>
      </div>
    </Layout>
  );
};
