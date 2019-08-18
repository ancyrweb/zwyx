import React from "react";
import { Client } from "zwyx";
import { getContext } from "./ReactContext";

type Props = {
  client: Client;
  children: React.ReactNode;
};

class Provider extends React.Component<Props> {
  render() {
    const ZwyxContext = getContext();
    const { client, children } = this.props;

    return (
      <ZwyxContext.Consumer>
        {context => {
          if (client && context.client !== client) {
            context = {
              ...context,
              client
            };
          }

          return (
            <ZwyxContext.Provider value={context}>
              {this.props.children}
            </ZwyxContext.Provider>
          );
        }}
      </ZwyxContext.Consumer>
    );
  }
}

export default Provider;
