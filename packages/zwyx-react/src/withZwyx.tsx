import React from "react";
import { getContext } from "./ReactContext";
import { Client } from "zwyx";

const withZwyx = <TOutProps extends any>(
  Component: React.ComponentType<{ zwyx: Client } & TOutProps>
) => (props: TOutProps) => {
  const { Consumer } = getContext();
  return (
    <Consumer>
      {({ client }) => {
        return <Component {...props} zwyx={client} />;
      }}
    </Consumer>
  );
};

export default withZwyx;
