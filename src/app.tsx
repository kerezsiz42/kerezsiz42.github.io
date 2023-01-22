import { useEffect } from "preact/hooks";
import { Redirect, Route, Switch, useLocation } from "wouter-preact";
import { reducer } from "./handler";
import { initDatabase } from "./idb";
import { ChatPage } from "./pages/Chat";
import { CreatePage } from "./pages/Create";
import { HomePage } from "./pages/Home";
import { Loading } from "./components/Loading";
import { SignInPage } from "./pages/SignIn";
import { ReconnectingWebSocket } from "./ReconnectingWebSocket";
import { connected, identity, loadIdentity, loading } from "./signals";
import { Layout } from "./components/Layout";

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
    const fn = async () => {
      const socket = new ReconnectingWebSocket();
      if (!identity.value) {
        socket.close();
        return;
      }
      const id = encodeURIComponent(
        JSON.stringify(
          await crypto.subtle.exportKey("jwk", identity.value.publicKey)
        )
      );
      socket.connect(
        `wss://noti-relay.deno.dev?id=${id}`,
        (isConnected) => (connected.value = isConnected),
        reducer
      );
      return () => socket.close();
    };
    fn();
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
      <Route path="/chat/:pk">
        {({ pk }) => {
          const [_, setLocation] = useLocation();
          const serializedPublicKey = decodeURIComponent(pk || "");
          if (serializedPublicKey === "") {
            setLocation("/");
          }
          return <ChatPage serializedPublicKey={serializedPublicKey} />;
        }}
      </Route>
      <Route path="/create" component={CreatePage} />
      <Route path="/" component={HomePage} />
      <Redirect to="/" />
    </Switch>
  );
};
