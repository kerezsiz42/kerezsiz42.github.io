import { Layout } from "../components/Layout";
import { identity } from "../stores/IdentityStoreSignals";
import { useSignal } from "@preact/signals";
import { useLocation } from "wouter-preact";
import { generateIdentity, importIdentity, loadIdentity } from "../functions";

export const Index = () => {
  const username = useSignal<string>("");
  const error = useSignal<string>("");
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      <div className="max-w-sm border border-white rounded p-8 my-2 mx-auto flex flex-col">
        <h1 className="text-center m-1 text-5xl">Noti</h1>
        <h2 className="text-center m-1">
          Sign in <i className="fa-solid fa-rocket"></i>
        </h2>
        {error.value !== "" ? (
          <div class="border-2 font-bold text-xs leading-5 rounded text-red-800 bg-red-300 border-red-800 my-2 p-2">
            Validation error:
            <br />
            {error.value}
          </div>
        ) : null}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (username.value === "") {
              error.value = "You must provide a username.";
              return;
            }
            const { publicKey, privateKey } = await generateIdentity();
            identity.value = {
              publicKey,
              privateKey,
              username: username.value,
            };
            setLocation("/home");
          }}
        >
          <label for="username">New username:</label>
          <input
            type="text"
            name="username"
            title="username"
            className="bg-black border border-white rounded outline-none p-1 my-1 w-full"
            onInput={({ target }) => {
              if (target instanceof HTMLInputElement) {
                username.value = target.value;
              }
            }}
            value={username.value}
            autofocus
          />
          <button
            type="submit"
            className="font-bold border rounded border-white p-1 my-1 w-full"
          >
            Generate new identity
          </button>
        </form>
        <span className="text-gray-300 mx-auto">- OR -</span>
        <label className="font-bold border rounded border-white p-1 my-1 text-center cursor-pointer">
          <input
            title="Import indentity"
            type="file"
            className="hidden"
            accept=".json"
            onChange={async ({ currentTarget }) => {
              if (currentTarget.files) {
                const id = await importIdentity(currentTarget.files);
                if (!id) {
                  error.value =
                    "Failed to import identity. Choose an exported json file that contains your identity.";
                  return;
                }
                identity.value = id;
                setLocation("/home");
              }
            }}
          />
          Import indentity
        </label>
      </div>
    </Layout>
  );
};
