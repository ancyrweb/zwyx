import Client from "../Client";
import createHttpLink from "../link/createHttpLink";
import createFakeFetch from "../utils/createFakeFetch";
import Normalizer from "../normalizer/Normalizer";
import CacheManager from "../cache/CacheManager";
import RAMCache from "../cache/RAMCache";

it("should create a client", async () => {
  const fakeFetch = createFakeFetch({ response: {} });
  const client = new Client({
    links: [
      createHttpLink({
        fetch: fakeFetch
      })
    ]
  });

  const result = await client.emit({
    request: {
      url: "https://someurl.com",
      method: "GET"
    }
  });

  expect(result).toEqual({
    raw: {},
    data: null,
    info: {
      headers: {},
      status: 200
    }
  });
});

it("should fetch and normalize data", async () => {
  const fakeFetch = createFakeFetch({
    response: [
      {
        id: 1,
        username: "rewieer",
        photos: [
          {
            id: 1,
            url: "https://someurl.com"
          }
        ]
      },
      {
        id: 2,
        username: "johndoe",
        photos: [
          {
            id: 2,
            url: "https://someurl.com"
          },
          {
            id: 3,
            url: "https://someurl.com"
          }
        ]
      }
    ]
  });

  const client = new Client({
    links: [
      createHttpLink({
        fetch: fakeFetch
      })
    ],
    cache: new CacheManager({
      cache: new RAMCache()
    }),
    normalizer: new Normalizer({
      entities: {
        users: {
          photos: ["photos"]
        }
      },
      routes: {
        "/users": "users"
      }
    })
  });

  const result = await client.emit({
    request: {
      url: "https://someurl.com/users",
      method: "GET"
    }
  });

  expect(result).toEqual({
    raw: [
      {
        id: 1,
        username: "rewieer",
        photos: [
          {
            id: 1,
            url: "https://someurl.com"
          }
        ]
      },
      {
        id: 2,
        username: "johndoe",
        photos: [
          {
            id: 2,
            url: "https://someurl.com"
          },
          {
            id: 3,
            url: "https://someurl.com"
          }
        ]
      }
    ],
    data: {
      users: {
        ids: [1, 2],
        entities: {
          "1": {
            id: 1,
            username: "rewieer",
            photos: [1]
          },
          "2": {
            id: 2,
            username: "johndoe",
            photos: [2, 3]
          }
        }
      },
      photos: {
        ids: [1, 2, 3],
        entities: {
          "1": {
            id: 1,
            url: "https://someurl.com"
          },
          "2": {
            id: 2,
            url: "https://someurl.com"
          },
          "3": {
            id: 3,
            url: "https://someurl.com"
          }
        }
      }
    },
    info: {
      headers: {},
      status: 200
    }
  });

  expect(await client.getCache().all()).toEqual({
    "users:1": {
      id: 1,
      username: "rewieer",
      photos: [1]
    },
    "users:2": {
      id: 2,
      username: "johndoe",
      photos: [2, 3]
    },
    "photos:1": {
      id: 1,
      url: "https://someurl.com"
    },
    "photos:2": {
      id: 2,
      url: "https://someurl.com"
    },
    "photos:3": {
      id: 3,
      url: "https://someurl.com"
    }
  });
});
