import { useEffect } from "preact/hooks";
import { Redirect, Route, Router, Switch } from "wouter-preact";
import { loadIdentity } from "./functions";
import { Chat } from "./pages/Chat";
import { Create } from "./pages/Create";
import { Home } from "./pages/Home";
import { SignIn } from "./pages/SignIn";
import { initDatabase } from "./stores/EntityStoreSignals";
import { identity } from "./stores/IdentityStoreSignals";

export const App = () => {
  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    const fn = async () => {
      const id = await loadIdentity();
      if (!id) {
        return;
      }
      identity.value = id;
    };
    fn();
  }, []);

  return (
    <Router>
      {identity.value ? (
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
      ) : (
        <SignIn />
      )}
    </Router>
  );
};
