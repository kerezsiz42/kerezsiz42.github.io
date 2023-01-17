import { useEffect } from "preact/hooks";
import { Redirect, Route, Switch } from "wouter-preact";
import { Loading } from "./pages/Loading";
import { loadIdentity } from "./functions";
import { Chat } from "./pages/Chat";
import { Create } from "./pages/Create";
import { Home } from "./pages/Home";
import { SignIn } from "./pages/SignIn";
import { initDatabase } from "./stores/EntityStoreSignals";
import { identity, loading } from "./stores/IdentityStoreSignals";

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

  if (loading.value) {
    return <Loading />;
  }
  if (identity.value) {
    return (
      <Switch>
        <Route path="/chat/:displayName/:serializedPublicKey">
          {({ displayName, serializedPublicKey }) => (
            <Chat
              displayName={decodeURIComponent(displayName || "")}
              serializedPublicKey={decodeURIComponent(
                serializedPublicKey || ""
              )}
            />
          )}
        </Route>
        <Route path="/create" component={Create} />
        <Route path="/" component={Home} />
        <Redirect to="/" />
      </Switch>
    );
  }
  return <SignIn />;
};
