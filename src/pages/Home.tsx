import { identity } from "../stores/IdentityStoreSignals";
import { Layout } from "../components/Layout";
import { useLocation } from "wouter-preact";
import { IDENTITY_STORAGE_NAME } from "../functions";
import { connected } from "../stores/WebSocketSignals";

export const Home = () => {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      <span>Status: {connected.value ? "Connected" : "Not connected"}</span>
      <a
        className="font-bold border rounded border-white p-1 m-2 text-center"
        href={`data:text/plain;charset=utf-8,${encodeURIComponent(
          localStorage.getItem(IDENTITY_STORAGE_NAME) || ""
        )}`}
        download={`${crypto.randomUUID()}.json`}
      >
        Save identity
      </a>
      <button
        type="button"
        className="font-bold border rounded border-white p-1 m-2"
        onClick={() => setLocation("/create")}
      >
        Create conversation
      </button>
      <button
        type="button"
        className="font-bold border rounded border-white p-1 m-2"
        onClick={() => {
          localStorage.removeItem(IDENTITY_STORAGE_NAME);
          identity.value = undefined;
          setLocation("/");
        }}
      >
        Remove identity
      </button>
    </Layout>
  );
};
