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
it("should fetch and normalize a single data in the cache", async () => {
  const fakeFetch = createFakeFetch({
    response: {
      id: 1,
      username: "rewieer",
      photos: [
        {
          id: 1,
          url: "https://someurl.com"
        }
      ]
    }
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
        "/users/:id": "users"
      }
    })
  });

  const result = await client.emit({
    request: {
      url: "https://someurl.com/users/1",
      method: "GET"
    }
  });

  expect(result).toEqual({
    raw: {
      id: 1,
      username: "rewieer",
      photos: [
        {
          id: 1,
          url: "https://someurl.com"
        }
      ]
    },
    data: {
      pathIds: {
        $root: {
          schema: "users",
          values: [1],
          isArray: false
        }
      },
      ids: {
        users: [1],
        photos: [1]
      },
      entities: {
        users: {
          "1": {
            id: 1,
            username: "rewieer",
            photos: [1]
          }
        },
        photos: {
          "1": {
            id: 1,
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
    "photos:1": {
      id: 1,
      url: "https://someurl.com"
    },
    '{"url":"https://someurl.com/users/1","method":"GET"}': {
      $root: {
        ids: 1,
        schema: "users"
      }
    }
  });
});
it("should fetch and normalize an array of data in the cache", async () => {
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
        "/users": ["users"]
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
      pathIds: {
        $root: {
          schema: "users",
          values: [1, 2],
          isArray: true
        }
      },
      ids: {
        users: [1, 2],
        photos: [1, 2, 3]
      },
      entities: {
        users: {
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
        },
        photos: {
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
    },
    '{"url":"https://someurl.com/users","method":"GET"}': {
      $root: {
        ids: [1, 2],
        schema: "users"
      }
    }
  });
});
it("should fetch and normalize an array of one entry in the cache", async () => {
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
        "/users": ["users"]
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
      }
    ],
    data: {
      pathIds: {
        $root: {
          schema: "users",
          values: [1],
          isArray: true
        }
      },
      ids: {
        users: [1],
        photos: [1]
      },
      entities: {
        users: {
          "1": {
            id: 1,
            username: "rewieer",
            photos: [1]
          }
        },
        photos: {
          "1": {
            id: 1,
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
    "photos:1": {
      id: 1,
      url: "https://someurl.com"
    },
    '{"url":"https://someurl.com/users","method":"GET"}': {
      $root: {
        ids: [1],
        schema: "users"
      }
    }
  });
});
it("should fetch and normalize when an empty object is returned", async () => {
  const fakeFetch = createFakeFetch({
    response: {}
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
        "/users/:id": "users"
      }
    })
  });

  const result = await client.emit({
    request: {
      url: "https://someurl.com/users/1",
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

  expect(await client.getCache().all()).toEqual({});
});
it("should fetch and normalize an empty array of data in the cache", async () => {
  const fakeFetch = createFakeFetch({
    response: []
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
        "/users": ["users"]
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
    raw: [],
    data: null,
    info: {
      headers: {},
      status: 200
    }
  });

  expect(await client.getCache().all()).toEqual({});
});
it("should fetch and normalize a complex structure of data", async () => {
  const fakeFetch = createFakeFetch({
    response: {
      online: [
        {
          id: 1,
          username: "rewieer"
        }
      ],
      offline: {
        friends: [
          {
            id: 2,
            username: "johndoe"
          },
          {
            id: 3,
            username: "janedoe"
          }
        ],
        captain: {
          id: 4,
          username: "whocares"
        }
      }
    }
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
        "/users": {
          online: ["users"],
          offline: {
            friends: ["users"],
            captain: "users"
          }
        }
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
    raw: {
      online: [
        {
          id: 1,
          username: "rewieer"
        }
      ],
      offline: {
        friends: [
          {
            id: 2,
            username: "johndoe"
          },
          {
            id: 3,
            username: "janedoe"
          }
        ],
        captain: {
          id: 4,
          username: "whocares"
        }
      }
    },
    data: {
      pathIds: {
        online: {
          schema: "users",
          values: [1],
          isArray: true
        },
        "offline.friends": {
          schema: "users",
          values: [2, 3],
          isArray: true
        },
        "offline.captain": {
          schema: "users",
          values: [4],
          isArray: false
        }
      },
      ids: {
        users: [1, 2, 3, 4]
      },
      entities: {
        users: {
          "1": {
            id: 1,
            username: "rewieer"
          },
          "2": {
            id: 2,
            username: "johndoe"
          },
          "3": {
            id: 3,
            username: "janedoe"
          },
          "4": {
            id: 4,
            username: "whocares"
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
      username: "rewieer"
    },
    "users:2": {
      id: 2,
      username: "johndoe"
    },
    "users:3": {
      id: 3,
      username: "janedoe"
    },
    "users:4": {
      id: 4,
      username: "whocares"
    },
    '{"url":"https://someurl.com/users","method":"GET"}': {
      online: {
        ids: [1],
        schema: "users"
      },
      offline: {
        friends: {
          ids: [2, 3],
          schema: "users"
        },
        captain: {
          ids: 4,
          schema: "users"
        }
      }
    }
  });
});
it("should fetch and normalize a complex structure of data containing empty values", async () => {
  const fakeFetch = createFakeFetch({
    response: {
      online: [],
      offline: {
        friends: [
          {
            id: 2,
            username: "johndoe"
          },
          {
            id: 3,
            username: "janedoe"
          }
        ],
        captain: null
      }
    }
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
        "/users": {
          online: ["users"],
          offline: {
            friends: ["users"],
            captain: "users"
          }
        }
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
    raw: {
      online: [],
      offline: {
        friends: [
          {
            id: 2,
            username: "johndoe"
          },
          {
            id: 3,
            username: "janedoe"
          }
        ],
        captain: null
      }
    },
    data: {
      pathIds: {
        online: {
          schema: "users",
          values: [],
          isArray: true
        },
        "offline.friends": {
          schema: "users",
          values: [2, 3],
          isArray: true
        },
        "offline.captain": {
          schema: "users",
          values: null,
          isArray: false
        }
      },
      ids: {
        users: [2, 3]
      },
      entities: {
        users: {
          "2": {
            id: 2,
            username: "johndoe"
          },
          "3": {
            id: 3,
            username: "janedoe"
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
    "users:2": {
      id: 2,
      username: "johndoe"
    },
    "users:3": {
      id: 3,
      username: "janedoe"
    },
    '{"url":"https://someurl.com/users","method":"GET"}': {
      online: {
        ids: [],
        schema: "users"
      },
      offline: {
        friends: {
          ids: [2, 3],
          schema: "users"
        },
        captain: {
          ids: null,
          schema: "users"
        }
      }
    }
  });
});
