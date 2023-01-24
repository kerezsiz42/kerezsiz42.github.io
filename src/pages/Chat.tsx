import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Link, useLocation } from "wouter-preact";
import { Avatar } from "../components/Avatar";
import { Layout } from "../components/Layout";
import { createChat, createMessage } from "../handler";
import { Chats, getMessagesBySender } from "../idb";
import { currentChat, Message } from "../signals";

type ChatPageProps = {
  publicKey?: string;
  displayName?: string;
};

export const ChatPage = ({
  publicKey = "",
  displayName = "",
}: ChatPageProps) => {
  const [_, setLocation] = useLocation();
  const messages = useSignal<Message[]>([]);
  const messageToSend = useSignal("");

  useEffect(() => {
    const fn = async () => {
      const foundChat = await Chats.get(publicKey);
      if (foundChat) {
        currentChat.value = foundChat;
        return;
      }
      try {
        await createChat(publicKey, displayName);
      } catch {
        setLocation("/");
      }
    };
    fn();
  }, []);

  useEffect(() => {
    const fn = async () => {
      messages.value = await getMessagesBySender(publicKey);
    };
    fn();
  }, [currentChat.value]);

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
        <Link href="/">
          <i className="fa-solid fa-bars text-3xl p-3 cursor-pointer"></i>
        </Link>
      </div>
      <div className="flex-1 flex flex-col">
        {messages.value.map((message) => (
          <span className="bg-blue-500 rounded-2xl p-2 m-2">{message}</span>
        ))}
      </div>
      <div className="border-gray-500 flex items-center border-t py-4 px-2 w-full">
        <textarea
          className="bg-black border border-white focus:outline-none w-full px-3 py-2 rounded-[2rem] resize-none overflow-hidden"
          placeholder="Type your message..."
          autofocus
          rows={1}
          onChange={({ target }) => {
            if (target instanceof HTMLTextAreaElement) {
              messageToSend.value = target.value;
            }
          }}
        ></textarea>
        <button
          type="button"
          onClick={async () => {
            await createMessage(messageToSend.value);
            messageToSend.value = "";
          }}
        >
          <i className="fa-solid fa-paper-plane py-2 text-2xl pr-3 pl-6 cursor-pointer"></i>
        </button>
      </div>
    </Layout>
  );
};
