import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Layout } from "../components/Layout";
import { QRCode } from "../components/QRCode";
import { publicKeyToBase64 } from "../functions";
import { identity } from "../stores/IdentityStoreSignals";

export const Create = () => {
  const text = useSignal("");

  useEffect(() => {
    const fun = async () => {
      if (!identity.value) {
        return;
      }
      const publicKey = encodeURIComponent(
        await publicKeyToBase64(identity.value.publicKey)
      );
      text.value = `${location.protocol}//${location.host}/chat/${publicKey}`;
    };
    fun();
  }, [identity.value]);

  return (
    <Layout>
      <div className="flex flex-col justify-center">
        <h1 className="text-center m-1 text-xl">Create a new conversation</h1>
        <p className="m-2">
          Show this QR code to the person you want to chat with:
        </p>
        <QRCode text={text.value} className="m-2" />
      </div>
    </Layout>
  );
};
