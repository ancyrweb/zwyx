import React from "react";
import Renderer from "react-test-renderer";
import { Client, createHttpLink } from "zwyx";
import Provider from "../Provider";
import { getContext } from "../ReactContext";

const client = new Client({
  links: [
    createHttpLink({
      fetch: jest.fn()
    })
  ]
});

describe("<Provider /> component", () => {
  it("should render the children", () => {
    const Comp: any = jest.fn(() => <div />);
    const renderer = Renderer.create(
      <Provider client={client}>
        <Comp />
      </Provider>
    );

    expect(Comp).toHaveBeenCalledTimes(1);
  });

  it("should pass the client to the children", () => {
    const consumer = jest.fn();
    const Comp: any = jest.fn(() => {
      const { Consumer } = getContext();
      return <Consumer>{consumer}</Consumer>;
    });
    const renderer = Renderer.create(
      <Provider client={client}>
        <Comp />
      </Provider>
    );

    expect(consumer).toHaveBeenCalledTimes(1);
    expect(consumer).toHaveBeenLastCalledWith({ client });
  });
});
