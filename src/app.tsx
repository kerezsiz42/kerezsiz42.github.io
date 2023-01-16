import { useEffect } from "preact/hooks";
import { Route, Router, Switch, useLocation } from "wouter-preact";
import { loadIdentity } from "./functions";
import { Chat } from "./pages/Chat";
import { Create } from "./pages/Create";
import { Home } from "./pages/Home";
import { Index } from "./pages/Index";
import { identity } from "./stores/IdentityStoreSignals";

export const App = () => {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const fn = async () => {
      const id = await loadIdentity();
      if (!id) {
        return;
      }
      identity.value = id;
      if (location === "/") {
        setLocation("/home");
      }
    };
    fn();
  }, []);

  return (
    <Router>
      <Switch>
        <Route path="/chat/:privateKey" component={Chat} />
        <Route path="/create" component={Create} />
        <Route path="/home" component={Home} />
        <Route path="/" component={Index} />
        <Route>404, Not Found!</Route>
      </Switch>
    </Router>
  );
};
