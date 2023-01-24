import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Layout } from "../components/Layout";
import { QRCode } from "../components/QRCode";
import { exportPublicKey } from "../encryption";
import { identity } from "../signals";

export const CreatePage = () => {
  const text = useSignal("");

  useEffect(() => {
    const fn = async () => {
      if (!identity.value) {
        return;
      }
      text.value = `${location.protocol}//${location.host}/chat/${
        identity.value.displayName
      }/${await exportPublicKey(identity.value.publicKey)}`;
    };
    fn();
  }, [identity.value]);

  return (
    <Layout>
      <h1 className="text-center m-1 text-xl">Create a new conversation</h1>
      <div className="w-full overflow-y-auto">
        <p className="m-2 text-justify">
          Show this QR code to the person you want to chat with or send them the
          link provided below via a trusted medium. Generally, you should never
          click on links that you do not trust.
        </p>
        <QRCode text={text.value} className="p-3 w-full" />
        <textarea
          title={text.value}
          className="w-full focus:outline-none bg-slate-800 p-3 rounded border-white border resize-none"
          rows={3}
          disabled
        >
          {text.value}
        </textarea>
      </div>
    </Layout>
  );
};
