import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Link, useLocation } from "wouter-preact";
import { Avatar } from "../components/Avatar";
import { Layout } from "../components/Layout";
import { base64ToPublicKey } from "../functions";
import { Entity } from "../stores/EntityStoreSignals";
import { messages } from "../stores/IdentityStoreSignals";

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
  const message = useSignal("");

  useEffect(() => {
    const fn = async () => {
      if (serializedPublicKey === "" || displayName === "") {
        setLocation("/");
        return;
      }
      const publicKey = await base64ToPublicKey(serializedPublicKey);
      entity.value = { publicKey, serializedPublicKey, displayName };
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
          rows={2}
          onChange={({ target }) => {
            if (target instanceof HTMLTextAreaElement) {
              message.value = target.value;
            }
          }}
        ></textarea>
        <button
          type="button"
          onClick={async () => {
            const id = encodeURIComponent(serializedPublicKey);
            const res = await fetch(`https://noti-relay.deno.dev?id=${id}`, {
              method: "POST",
              body: JSON.stringify({ message: message.value }),
            });
            console.log(res.status);
          }}
        >
          <i className="fa-solid fa-paper-plane py-2 text-2xl pr-3 pl-6 cursor-pointer"></i>
        </button>
      </div>
    </Layout>
  );
};
