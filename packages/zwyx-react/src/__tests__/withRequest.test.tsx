import React from "react";
import Renderer from "react-test-renderer";
import { Client, createHttpLink } from "zwyx";
import Provider from "../Provider";
import { getContext } from "../ReactContext";
import withRequest from "../withRequest";

let client = null;

const createClient = (config?: {
  response?: () => {
    status?: number;
    headers?: {};
    data?: object | null;
  };
}) => {
  const fetch = jest.fn(() => {
    const response = config && config.response ? config.response() : null;
    return Promise.resolve({
      status: response && response.status ? response.status : 200,
      headers: response && response.headers ? response.headers : {},
      json() {
        return Promise.resolve(
          response && response.data ? response.data : null
        );
      }
    });
  });
  client = new Client({
    links: [
      createHttpLink({
        fetch
      })
    ]
  });

  return {
    client,
    fetch
  };
};

describe("request HOC", () => {
  it("should connect a request and update children on response", done => {
    const { client } = createClient({
      response: () => {
        return {
          status: 200,
          data: [
            {
              id: 1,
              username: "rewieer"
            }
          ]
        };
      }
    });

    const testRequest = withRequest({
      name: "users",
      request: {
        url: "http://site.com/users"
      }
    });

    const DummyComponent = testRequest(props => {
      if (props.users.data) {
        expect(props.users.loading).toBe(false);
        expect(props.users.error).toBe(null);
        expect(props.users.data).toEqual([
          {
            id: 1,
            username: "rewieer"
          }
        ]);

        done();
      }
      return <div />;
    });

    Renderer.create(
      <Provider client={client}>
        <DummyComponent />
      </Provider>
    );
  });
});
