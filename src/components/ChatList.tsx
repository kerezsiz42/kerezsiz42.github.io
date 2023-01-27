import { Link } from "wouter-preact";
import { Chat } from "../types";
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
          href={`${location.protocol}//${
            location.host
          }/chat/${encodeURIComponent(chat.serializedPublicKey)}`}
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
            {/* <Link href="">
              <i className="fa-solid fa-pen-to-square border-2 p-2 border-white rounded-[50%]"></i>
            </Link> */}
          </div>
        </Link>
      ))}
    </div>
  );
};
