import { Layout } from "../components/Layout";
import { identity, loadIdentityFromFile, loading } from "../signals";
import { useSignal } from "@preact/signals";
import { Loading } from "../components/Loading";

export const SignInPage = () => {
  const displayName = useSignal<string>("");
  const error = useSignal<string>("");

  if (loading.value) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

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
            loading.value = true;
            e.preventDefault();
            if (displayName.value === "") {
              error.value = "You must provide a username.";
              loading.value = false;
              return;
            }
            const { publicKey, privateKey } = await crypto.subtle.generateKey(
              {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
              },
              true,
              ["encrypt", "decrypt"]
            );
            identity.value = {
              publicKey,
              privateKey,
              displayName: displayName.value,
            };
            loading.value = false;
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
                displayName.value = target.value;
              }
            }}
            value={displayName.value}
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
              loading.value = true;
              if (currentTarget.files) {
                const id = await loadIdentityFromFile(currentTarget.files);
                if (!id) {
                  error.value =
                    "Failed to import identity. Choose an exported json file that contains your identity.";
                  loading.value = false;
                  return;
                }
                identity.value = id;
              }
              loading.value = false;
            }}
          />
          Import indentity
        </label>
      </div>
    </Layout>
  );
};
