import { Layout } from "../components/Layout";
import { Link } from "wouter-preact";
import { connected } from "../stores/WebSocketSignals";
import { Chevron } from "../components/Chevron";
import { Menu } from "../components/Menu";
import { EntityList } from "../components/EntityList";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { Entity, listEntities } from "../stores/EntityStoreSignals";

export const Home = () => {
  const entites = useSignal<Entity[]>([]);

  useEffect(() => {
    const fn = async () => {
      entites.value = await listEntities();
    };
    fn();
  }, []);

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
      <EntityList entities={entites.value} />
      <Link href="/create">
        <div className="absolute bg-blue-500 w-20 h-20 flex justify-center items-center rounded-[50%] cursor-pointer right-10 bottom-10">
          <i className="fa-solid fa-plus text-3xl"></i>
        </div>
      </Link>
    </Layout>
  );
};
