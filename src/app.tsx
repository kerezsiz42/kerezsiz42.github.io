import { useEffect } from "preact/hooks";
import { Redirect, Route, Router, Switch } from "wouter-preact";
import { loadIdentity } from "./functions";
import { Chat } from "./pages/Chat";
import { Create } from "./pages/Create";
import { Home } from "./pages/Home";
import { SignIn } from "./pages/SignIn";
import { identity } from "./stores/IdentityStoreSignals";

export const App = () => {
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
          <Route path="/chat/:privateKey" component={Chat} />
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
