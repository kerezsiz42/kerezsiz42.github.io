import { useEffect } from "preact/hooks";
import { Redirect, Route, Switch } from "wouter-preact";
import { ChatPage } from "./pages/Chat";
import { CreatePage } from "./pages/Create";
import { HomePage } from "./pages/Home";
import { Loading } from "./components/Loading";
import { SignInPage } from "./pages/SignIn";
import { ReconnectingWebSocket } from "./ReconnectingWebSocket";
import { connected, getIdentity, identity, loading } from "./signals";
import { Layout } from "./components/Layout";
import { reducer } from "./handlers";

export const App = () => {
  useEffect(() => {
    const fn = async () => {
      loading.value = true;
      const id = await getIdentity();
      if (id) {
        identity.value = id;
      }
      loading.value = false;
    };
    fn();
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    const socket = new ReconnectingWebSocket(ac.signal);
    if (!identity.value) {
      ac.abort();
      return;
    }
    socket.connect(
      `wss://noti-relay.deno.dev?id=${identity.value.serializedPublicKey}`,
      (isConnected) => (connected.value = isConnected),
      reducer
    );
    return () => ac.abort();
  }, [identity.value]);

  if (loading.value) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!identity.value) {
    return <SignInPage />;
  }

  return (
    <Switch>
      <Route path="/chat/:displayName/:publicKey">
        {({ displayName, publicKey }) => (
          <ChatPage publicKey={publicKey} displayName={displayName} />
        )}
      </Route>
      <Route path="/create" component={CreatePage} />
      <Route path="/" component={HomePage} />
      <Redirect to="/" />
    </Switch>
  );
};
