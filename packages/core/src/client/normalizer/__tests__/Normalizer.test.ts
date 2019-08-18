import Normalizer from "../Normalizer";

describe("normalization", () => {
  it("should normalize data", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
        }
      }
    });

    const normalized = normalizer.normalize("users", {
      id: 1,
      name: "rewieer",
      photo: {
        id: 2,
        url: "https://someurl.com"
      }
    });

    expect(normalized).toEqual({
      pathIds: {
        $root: {
          schema: "users",
          values: [1],
          isArray: false
        }
      },
      ids: {
        users: [1],
        photos: [2]
      },
      entities: {
        users: {
          "1": {
            id: 1,
            name: "rewieer",
            photo: 2
          }
        },
        photos: {
          "2": {
            id: 2,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should normalize data with subarrays", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photos: ["photos"]
        }
      }
    });

    const normalized = normalizer.normalize("users", {
      id: 1,
      name: "rewieer",
      photos: [
        {
          id: 1,
          url: "https://someurl.com"
        },
        {
          id: 2,
          url: "https://someurl.com"
        }
      ]
    });

    expect(normalized).toEqual({
      pathIds: {
        $root: {
          schema: "users",
          values: [1],
          isArray: false
        }
      },
      ids: {
        users: [1],
        photos: [1, 2]
      },
      entities: {
        users: {
          "1": {
            id: 1,
            name: "rewieer",
            photos: [1, 2]
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
          }
        }
      }
    });
  });
  it("should normalize an array of data", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
        }
      }
    });

    const normalized = normalizer.normalize("users", [
      {
        id: 1,
        name: "rewieer",
        photo: {
          id: 2,
          url: "https://someurl.com"
        }
      },
      {
        id: 2,
        name: "johndoe",
        photo: {
          id: 4,
          url: "https://someurl.com"
        }
      }
    ]);

    expect(normalized).toEqual({
      pathIds: {
        $root: {
          schema: "users",
          values: [1, 2],
          isArray: true
        }
      },
      ids: {
        users: [1, 2],
        photos: [2, 4]
      },
      entities: {
        users: {
          "1": {
            id: 1,
            name: "rewieer",
            photo: 2
          },
          "2": {
            id: 2,
            name: "johndoe",
            photo: 4
          }
        },
        photos: {
          "2": {
            id: 2,
            url: "https://someurl.com"
          },
          "4": {
            id: 4,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should use custom ID", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          id: "user_id",
          photo: "photos"
        }
      }
    });

    const normalized = normalizer.normalize("users", {
      user_id: 1,
      name: "rewieer",
      photo: {
        id: 2,
        url: "https://someurl.com"
      }
    });

    expect(normalized).toEqual({
      pathIds: {
        $root: {
          schema: "users",
          values: [1],
          isArray: false
        }
      },
      ids: {
        users: [1],
        photos: [2]
      },
      entities: {
        users: {
          "1": {
            user_id: 1,
            name: "rewieer",
            photo: 2
          }
        },
        photos: {
          "2": {
            id: 2,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should use custom ID of nested schemas", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          id: "user_id",
          photo: "photos"
        },
        photos: {
          id: "photo_id"
        }
      }
    });

    const normalized = normalizer.normalize("users", {
      user_id: 1,
      name: "rewieer",
      photo: {
        photo_id: 2,
        url: "https://someurl.com"
      }
    });

    expect(normalized).toEqual({
      pathIds: {
        $root: {
          schema: "users",
          values: [1],
          isArray: false
        }
      },
      ids: {
        users: [1],
        photos: [2]
      },
      entities: {
        users: {
          "1": {
            user_id: 1,
            name: "rewieer",
            photo: 2
          }
        },
        photos: {
          "2": {
            photo_id: 2,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should recognize a route", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
        }
      },
      routes: {
        "/users/1": "users"
      }
    });

    const normalized = normalizer.normalize("/users/1", {
      id: 1,
      name: "rewieer",
      photo: {
        id: 1,
        url: "https://someurl.com"
      }
    });

    expect(normalized).toEqual({
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
            name: "rewieer",
            photo: 1
          }
        },
        photos: {
          "1": {
            id: 1,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should recognize a route with an array", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
        }
      },
      routes: {
        "/users/1": ["users"]
      }
    });

    const normalized = normalizer.normalize("/users/1", [
      {
        id: 1,
        name: "rewieer",
        photo: {
          id: 1,
          url: "https://someurl.com"
        }
      }
    ]);

    expect(normalized).toEqual({
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
            name: "rewieer",
            photo: 1
          }
        },
        photos: {
          "1": {
            id: 1,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should recognize a route with dynamic parameters", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
        }
      },
      routes: {
        "/users/:id": "users"
      }
    });

    const normalized = normalizer.normalize("/users/1", {
      id: 1,
      name: "rewieer",
      photo: {
        id: 1,
        url: "https://someurl.com"
      }
    });

    expect(normalized).toEqual({
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
            name: "rewieer",
            photo: 1
          }
        },
        photos: {
          "1": {
            id: 1,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should recognize a route with dynamic parameters and arguments", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
        }
      },
      routes: {
        "/users/:id": "users"
      }
    });

    const normalized = normalizer.normalize("/users/1?foo=bar&key=stuff", {
      id: 1,
      name: "rewieer",
      photo: {
        id: 1,
        url: "https://someurl.com"
      }
    });

    expect(normalized).toEqual({
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
            name: "rewieer",
            photo: 1
          }
        },
        photos: {
          "1": {
            id: 1,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should recognize a specific return type and normalize it", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
        }
      },
      routes: {
        "/users/:id": {
          foo: {
            bar: {
              qux: "users"
            }
          }
        }
      }
    });

    const normalized = normalizer.normalize("/users/1?foo=bar&key=stuff", {
      foo: {
        bar: {
          qux: {
            id: 1,
            name: "rewieer",
            photo: {
              id: 1,
              url: "https://someurl.com"
            }
          }
        }
      }
    });

    expect(normalized).toEqual({
      pathIds: {
        "foo.bar.qux": {
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
            name: "rewieer",
            photo: 1
          }
        },
        photos: {
          "1": {
            id: 1,
            url: "https://someurl.com"
          }
        }
      }
    });
  });
  it("should normalize a specific return type that's more complex", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
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
    });

    const normalized = normalizer.normalize("/users", {
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
    });

    expect(normalized).toEqual({
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
    });
  });
  it("should normalized nested schemas with conflicts", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
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
    });

    const normalized = normalizer.normalize("/users", {
      online: [
        {
          id: 1,
          username: "rewieer"
        }
      ],
      offline: {
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

    expect(normalized).toEqual({
      pathIds: {
        online: {
          schema: "users",
          values: [1],
          isArray: true
        },
        "offline.friends": {
          schema: "users",
          values: [1, 2],
          isArray: true
        },
        "offline.captain": {
          schema: "users",
          values: [1],
          isArray: false
        }
      },
      ids: {
        users: [1, 2]
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
          }
        }
      }
    });
  });
  it("should normalize complex schema with empty arrays and null", () => {
    const normalizer = new Normalizer({
      entities: {
        users: {
          photo: "photos"
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
    });

    const normalized = normalizer.normalize("/users", {
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
    });

    expect(normalized).toEqual({
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
    });
  });
});

describe("reconstruction", () => {
  it("should provide reconstruction for a route", () => {
    const normalizer = new Normalizer({
      entities: {
        users: null
      },
      routes: {
        "/users/:id": "users"
      }
    });

    expect(normalizer.getReconstructionInfo("/users/3")).toEqual([
      {
        path: null,
        schema: "users",
        isArray: false
      }
    ]);
  });
  it("should provide reconstruction for a route with an array schema", () => {
    const normalizer = new Normalizer({
      entities: {
        users: null
      },
      routes: {
        "/users/:id": ["users"]
      }
    });

    expect(normalizer.getReconstructionInfo("/users/3")).toEqual([
      {
        path: null,
        schema: "users",
        isArray: true
      }
    ]);
  });
  it("should provide reconstruction for a route with one deep schema", () => {
    const normalizer = new Normalizer({
      entities: {
        users: null
      },
      routes: {
        "/users/:id": {
          foo: {
            bar: {
              qux: "users"
            }
          }
        }
      }
    });

    expect(normalizer.getReconstructionInfo("/users/3")).toEqual([
      {
        path: "foo.bar.qux",
        schema: "users",
        isArray: false
      }
    ]);
  });
  it("should provide reconstruction for a route with multiple deep schemas", () => {
    const normalizer = new Normalizer({
      entities: {
        users: null
      },
      routes: {
        "/users/:id": {
          foo: {
            bar: {
              qux: "users"
            },
            baz: {
              qux: ["users"]
            }
          }
        }
      }
    });

    expect(normalizer.getReconstructionInfo("/users/3")).toEqual([
      {
        path: "foo.bar.qux",
        schema: "users",
        isArray: false
      },
      {
        path: "foo.baz.qux",
        schema: "users",
        isArray: true
      }
    ]);
  });
});
