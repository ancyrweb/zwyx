import React from "react";
import Renderer from "react-test-renderer";
import {
  CacheManager,
  Client,
  createHttpLink,
  Normalizer,
  RAMCache
} from "zwyx";
import Provider from "../Provider";
import withRequest from "../withRequest";
import catchAsyncError from "../testUtils/catchAsyncError";

let client: Client | null = null;

const createClient = (config?: {
  response?: () => {
    status?: number;
    headers?: {};
    data?: object | null;
  };
  normalizer?: Normalizer | null;
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
    ],
    normalizer: config.normalizer || undefined,
    cache: new CacheManager({
      cache: new RAMCache()
    })
  });

  return {
    client,
    fetch
  };
};

describe("withRequest HOC", () => {
  it("should connect when receiving a single of entity", done => {
    const { client } = createClient({
      response: () => {
        return {
          status: 200,
          data: {
            id: 1,
            username: "rewieer"
          }
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
      catchAsyncError(done, () => {
        if (props.users.error) {
          throw props.users.error;
        }

        if (props.users.data) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual({
            id: 1,
            username: "rewieer"
          });

          done();
        }
      });

      return <div />;
    });

    Renderer.create(
      <Provider client={client}>
        <DummyComponent />
      </Provider>
    );
  });
  it("should connect when receiving an array of entities", done => {
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
      catchAsyncError(done, () => {
        if (props.users.error) {
          throw props.users.error;
        }

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
      });

      return <div />;
    });

    Renderer.create(
      <Provider client={client}>
        <DummyComponent />
      </Provider>
    );
  });

  it("should connect when receiving a single entity and update on cache update", done => {
    const { client } = createClient({
      normalizer: new Normalizer({
        entities: {
          users: {}
        },
        routes: {
          users: "users"
        }
      }),
      response: () => {
        return {
          status: 200,
          data: {
            id: 1,
            username: "rewieer"
          }
        };
      }
    });

    const testRequest = withRequest({
      name: "users",
      request: {
        url: "http://site.com/users"
      }
    });

    let step = 0;

    const DummyComponent = testRequest(props => {
      catchAsyncError(done, () => {
        if (props.users.error) {
          throw props.users.error;
        }

        if (!props.users.data && step === 0) return;

        if (step === 0) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual({
            id: 1,
            username: "rewieer"
          });

          setTimeout(() => {
            step++;
            client.getCache().set("users:1", {
              id: 1,
              username: "johndoe"
            });
          }, 0);
        } else if (step === 1) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual({
            id: 1,
            username: "johndoe"
          });

          setTimeout(() => {
            step++;

            const cacheKey = client.getCacheManager().createRequestCacheKey({
              url: "http://site.com/users"
            });
            client.getCache().set(cacheKey, {
              $root: {
                ids: null,
                schema: "users"
              }
            });
          }, 0);
        } else if (step === 2) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual(null);
          done();
        }
      });

      return <div />;
    });

    Renderer.create(
      <Provider client={client}>
        <DummyComponent />
      </Provider>
    );
  });
  it("should connect when receiving an array of entities and update on cache update", done => {
    const { client } = createClient({
      normalizer: new Normalizer({
        entities: {
          users: {}
        },
        routes: {
          users: ["users"]
        }
      }),
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

    let step = 0;

    const DummyComponent = testRequest(props => {
      catchAsyncError(done, () => {
        if (props.users.error) {
          throw props.users.error;
        }

        if (!props.users.data) return;

        if (step === 0) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual([
            {
              id: 1,
              username: "rewieer"
            }
          ]);

          setTimeout(() => {
            step++;
            client.getCache().set("users:1", {
              id: 1,
              username: "johndoe"
            });
          }, 0);
        } else if (step === 1) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual([
            {
              id: 1,
              username: "johndoe"
            }
          ]);

          setTimeout(() => {
            step++;

            const cacheKey = client.getCacheManager().createRequestCacheKey({
              url: "http://site.com/users"
            });
            client.getCache().set(cacheKey, {
              $root: {
                ids: [],
                schema: "users"
              }
            });
          }, 0);
        } else if (step === 2) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual([]);
          done();
        }
      });

      return <div />;
    });

    Renderer.create(
      <Provider client={client}>
        <DummyComponent />
      </Provider>
    );
  });
  it("should connect when receiving data in a complex form and update on cache update", done => {
    const { client } = createClient({
      normalizer: new Normalizer({
        entities: {
          users: {}
        },
        routes: {
          users: {
            offline: ["users"],
            online: {
              friends: ["users"],
              captain: "users"
            }
          }
        }
      }),
      response: () => {
        return {
          status: 200,
          data: {
            offline: [],
            online: {
              friends: [
                {
                  id: 1,
                  username: "rewieer"
                },
                {
                  id: 2,
                  username: "johndoe"
                }
              ],
              captain: {
                id: 1,
                username: "rewieer"
              }
            }
          }
        };
      }
    });

    const testRequest = withRequest({
      name: "users",
      request: {
        url: "http://site.com/users"
      }
    });

    let step = 0;

    const DummyComponent = testRequest(props => {
      catchAsyncError(done, () => {
        if (props.users.error) {
          throw props.users.error;
        }

        if (!props.users.data) return;

        if (step === 0) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual({
            offline: [],
            online: {
              friends: [
                {
                  id: 1,
                  username: "rewieer"
                },
                {
                  id: 2,
                  username: "johndoe"
                }
              ],
              captain: {
                id: 1,
                username: "rewieer"
              }
            }
          });

          setTimeout(() => {
            step++;
            client.getCache().set("users:1", {
              id: 1,
              username: "janedoe"
            });
          }, 0);
        } else if (step === 1) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual({
            offline: [],
            online: {
              friends: [
                {
                  id: 1,
                  username: "janedoe"
                },
                {
                  id: 2,
                  username: "johndoe"
                }
              ],
              captain: {
                id: 1,
                username: "janedoe"
              }
            }
          });

          setTimeout(() => {
            step++;

            const cacheKey = client.getCacheManager().createRequestCacheKey({
              url: "http://site.com/users"
            });

            client.getCache().set(cacheKey, {
              offline: {
                ids: [1],
                schema: "users"
              },
              online: {
                friends: {
                  ids: [2],
                  schema: "users"
                },
                captain: {
                  ids: null,
                  schema: "users"
                }
              }
            });
          }, 0);
        } else if (step === 2) {
          expect(props.users.loading).toBe(false);
          expect(props.users.error).toBe(null);
          expect(props.users.data).toEqual({
            offline: [
              {
                id: 1,
                username: "janedoe"
              }
            ],
            online: {
              friends: [
                {
                  id: 2,
                  username: "johndoe"
                }
              ],
              captain: null
            }
          });
          done();
        }
      });

      return <div />;
    });

    Renderer.create(
      <Provider client={client}>
        <DummyComponent />
      </Provider>
    );
  });
});
