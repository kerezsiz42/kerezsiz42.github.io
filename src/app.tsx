import { useEffect } from "preact/hooks";
import { Redirect, Route, Switch } from "wouter-preact";
import { ChatPage } from "./pages/Chat";
import { CreatePage } from "./pages/Create";
import { HomePage } from "./pages/Home";
import { Loading } from "./components/Loading";
import { SignInPage } from "./pages/SignIn";
import { getIdentity, identity, loading } from "./signals";
import { Layout } from "./components/Layout";
import { Identity } from "./types";

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
      <Route path="/chat/:publicKey">
        {({ publicKey }) => (
          <ChatPage
            publicKey={decodeURIComponent(publicKey || "")}
            identity={identity.value as Identity}
          />
        )}
      </Route>
      <Route path="/create">
        <CreatePage identity={identity.value as Identity} />
      </Route>
      <Route path="/">
        <HomePage />
      </Route>
      <Redirect to="/" />
    </Switch>
  );
};
