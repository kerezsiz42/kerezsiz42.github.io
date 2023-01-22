import { Layout } from "../components/Layout";
import { Link } from "wouter-preact";
import { connected, Chat } from "../signals";
import { Chevron } from "../components/Chevron";
import { Menu } from "../components/Menu";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";

export const HomePage = () => {
  const entites = useSignal<Chat[]>([]);

  useEffect(() => {}, []);

  return (
    <Layout>
      <div class="flex items-center justify-between px-5 py-3 w-full">
        <h1 class="font-bold text-2xl w-full">Conversations</h1>
        <Chevron />
      </div>
      <Menu />
      <div className="w-full text-center">
        <span>Status: {connected.value ? "Connected" : "Not connected"}</span>
      </div>
      <div className="flex-1"></div>
      <Link href="/create">
        <div className="absolute bg-blue-500 w-20 h-20 flex justify-center items-center rounded-[50%] cursor-pointer right-10 bottom-10">
          <i className="fa-solid fa-plus text-3xl"></i>
        </div>
      </Link>
    </Layout>
  );
};
