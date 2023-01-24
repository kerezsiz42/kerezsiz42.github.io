import { Link } from "wouter-preact";
import { Chat } from "../signals";
import { Avatar } from "./Avatar";

type ChatListProps = {
  chats: Chat[];
};

export const ChatList = ({ chats }: ChatListProps) => {
  return (
    <div className="flex-1 w-full p-3">
      {chats.map((chat, index) => (
        <Link
          className="cursor-pointer"
          href={`${location.protocol}//${location.host}/chat/${chat.displayName}/${chat.serializedPublicKey}`}
        >
          <div
            className={`flex items-center justify-between border border-gray-500 rounded font-bold py-4 px-8 ${
              index === chats.length - 1 ? "" : "mb-3"
            }`}
          >
            <div className="flex items-center">
              <Avatar alt={chat.displayName} />
              <span className="px-4 text-xl">{chat.displayName}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
