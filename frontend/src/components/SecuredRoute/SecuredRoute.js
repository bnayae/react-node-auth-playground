import React from "react";
import { Route } from "react-router-dom";
import auth0Client from "../../Auth";

function SecuredRoute(props) {
  const { component: Component, path } = props;
  return (
    <Route
      path={path}
      render={() => {
        const isAuth = auth0Client.isAuthenticated();
        console.log(`##  ${isAuth}`);
        if (!isAuth) {
          auth0Client.signIn();
          return <div>Log-in required</div>;
        }
        return <Component />;
      }}
    />
  );
}

export default SecuredRoute;
