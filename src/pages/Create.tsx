import { Layout } from "../components/Layout";
import { QRCode } from "../components/QRCode";
import { Identity } from "../types";

type CreatePageProps = {
  identity: Identity;
};

export const CreatePage = ({ identity }: CreatePageProps) => {
  const text = `${location.protocol}//${
    location.host
  }/chat/${encodeURIComponent(identity.serializedPublicKey)}`;
  return (
    <Layout>
      <h1 className="text-center m-1 text-xl">Create a new conversation</h1>
      <div className="w-full overflow-y-auto">
        <p className="m-2 text-justify">
          Show this QR code to the person you want to chat with or send them the
          link provided below via a trusted medium. Generally, you should never
          click on links that you do not trust.
        </p>
        <QRCode text={text} className="p-3 w-full" />
        <textarea
          title={text}
          value={text}
          className="w-full focus:outline-none bg-slate-800 p-3 rounded border-white border resize-none"
          rows={3}
          disabled
        />
      </div>
    </Layout>
  );
};
