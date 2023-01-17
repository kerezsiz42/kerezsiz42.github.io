import { Layout } from "../components/Layout";
import { Link } from "wouter-preact";
import { connected } from "../stores/WebSocketSignals";
import { Chevron } from "../components/Chevron";
import Menu from "../components/Menu";

export const Home = () => {
  return (
    <Layout>
      <div class="flex items-center justify-between px-5 py-3 w-full">
        <h1 class="font-bold text-2xl w-full">Conversations</h1>
        <Chevron />
      </div>
      <Menu />
      <div className="flex-1">
        <span>Status: {connected.value ? "Connected" : "Not connected"}</span>
      </div>
      <Link href="/create">
        <div className="absolute bg-blue-500 w-20 h-20 flex justify-center items-center rounded-[50%] cursor-pointer right-12 bottom-12">
          <i className="fa-solid fa-plus text-3xl"></i>
        </div>
      </Link>
    </Layout>
  );
};
