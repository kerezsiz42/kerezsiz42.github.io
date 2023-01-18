import { useEffect } from "preact/hooks";
import { Redirect, Route, Switch } from "wouter-preact";
import { z } from "zod";
import { loadIdentity } from "./functions";
import { Chat } from "./pages/Chat";
import { Create } from "./pages/Create";
import { Home } from "./pages/Home";
import { Loading } from "./pages/Loading";
import { SignIn } from "./pages/SignIn";
import { ReconnectingWebSocket } from "./ReconnectingWebSocket";
import { initDatabase } from "./stores/EntityStoreSignals";
import {
  connected,
  identity,
  loading,
  messages,
} from "./stores/IdentityStoreSignals";

export const App = () => {
  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    const fn = async () => {
      loading.value = true;
      const id = await loadIdentity();
      if (!id) {
        loading.value = false;
        return;
      }
      identity.value = id;
      loading.value = false;
    };
    fn();
  }, []);

  useEffect(() => {
    if (!identity.value) {
      return;
    }
    const socket = new ReconnectingWebSocket();
    const id = encodeURIComponent(identity.value.serializedPublicKey);
    socket.connect(
      `wss://noti-relay.deno.dev?id=${id}`,
      (isConnected) => (connected.value = isConnected),
      (data) => {
        const result = z.object({ message: z.string() }).safeParse(data);
        if (!result.success) {
          return;
        }
        messages.value = [...messages.value, result.data.message];
      }
    );
    return () => socket.close();
  }, [identity.value]);

  if (loading.value) {
    return <Loading />;
  }

  if (!identity.value) {
    return <SignIn />;
  }

  return (
    <Switch>
      <Route path="/chat/:displayName/:serializedPublicKey">
        {({ displayName, serializedPublicKey }) => (
          <Chat
            displayName={decodeURIComponent(displayName || "")}
            serializedPublicKey={decodeURIComponent(serializedPublicKey || "")}
          />
        )}
      </Route>
      <Route path="/create" component={Create} />
      <Route path="/" component={Home} />
      <Redirect to="/" />
    </Switch>
  );
};
