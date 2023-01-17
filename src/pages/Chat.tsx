import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Link, useLocation } from "wouter-preact";
import { Avatar } from "../components/Avatar";
import { Layout } from "../components/Layout";
import { base64ToPublicKey } from "../functions";
import { Entity } from "../stores/EntityStoreSignals";
import { loading } from "../stores/IdentityStoreSignals";

type Optional<T extends Record<string, unknown>, U extends keyof T> = Omit<
  T,
  U
> &
  Partial<Pick<T, U>>;

export const Chat = ({
  serializedPublicKey,
  displayName,
}: Omit<Entity, "symmetricKey" | "publicKey">) => {
  const entity = useSignal<Optional<Entity, "symmetricKey"> | undefined>(
    undefined
  );
  const [_, setLocation] = useLocation();

  useEffect(() => {
    const fn = async () => {
      loading.value = true;
      if (serializedPublicKey === "" || displayName === "") {
        setLocation("/");
        loading.value = false;
        return;
      }
      const publicKey = await base64ToPublicKey(serializedPublicKey);
      entity.value = { publicKey, serializedPublicKey, displayName };
      loading.value = false;
    };
    fn();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between p-3 border-b border-gray-500 w-full">
        <div className="flex items-center">
          <Avatar alt={entity.value?.displayName} src={entity.value?.avatar} />
          <h1 className="pl-4 font-bold">{entity.value?.displayName}</h1>
        </div>
        <Link href="/">
          <i className="fa-solid fa-bars text-3xl p-3 cursor-pointer"></i>
        </Link>
      </div>
      <div className="flex-1"></div>
      <div className="border-gray-500 flex items-center border-t py-4 px-2 w-full">
        <input
          className="bg-black border border-white focus:outline-none w-full px-3 py-2 rounded-[2rem]"
          type="text"
          placeholder="Type your message..."
        ></input>
        <i className="fa-solid fa-paper-plane py-2 text-2xl pr-3 pl-6 cursor-pointer"></i>
      </div>
    </Layout>
  );
};
