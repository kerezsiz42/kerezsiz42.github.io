import { Layout } from "../components/Layout";
import { Link } from "wouter-preact";
import {
  chats,
  connected,
  currentChat,
  deleteIdentity,
  downloadIdentity,
  messages,
} from "../signals";
import { Chevron } from "../components/Chevron";
import { Menu } from "../components/Menu";
import { useSignal } from "@preact/signals";
import { ChatList } from "../components/ChatList";

export const HomePage = () => {
  const enabled = useSignal<boolean>(false);
  currentChat.value = undefined;
  messages.value = [];

  return (
    <Layout>
      <div class="flex items-center justify-between px-5 py-3 w-full">
        <h1 class="font-bold text-2xl w-full">Conversations</h1>
        <Chevron
          toggle={() => (enabled.value = !enabled.value)}
          enabled={enabled.value}
        />
      </div>
      <Menu
        enabled={enabled.value}
        onEdit={() => console.log("edit")}
        onSignOut={deleteIdentity}
        onSave={downloadIdentity}
      />
      <div className="w-full text-center">
        <span>Status: {connected.value ? "Connected" : "Disconnected"}</span>
      </div>
      <ChatList chats={chats.value} />
      <Link href="/create">
        <div className="absolute bg-blue-500 w-20 h-20 flex justify-center items-center rounded-[50%] cursor-pointer right-10 bottom-10">
          <i className="fa-solid fa-plus text-3xl"></i>
        </div>
      </Link>
    </Layout>
  );
};
