import Normalizer from "../Normalizer";

it("should normalize nothing", () => {
  const normalizer = new Normalizer();
})

it("should normalize data", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        photo: "photos",
      },
    }
  });

  const normalized = normalizer.normalize("users", {
    id: 1,
    name: "rewieer",
    photo: {
      id: 2,
      url: "https://someurl.com",
    }
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          name: "rewieer",
          photo: 2,
        }
      }
    },
    photos: {
      ids: [2],
      entities: {
        "2": {
          id: 2,
          url: "https://someurl.com",
        }
      }
    }
  })
});

it("should normalize data with subarrays", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        photos: ["photos"],
      },
    }
  });

  const normalized = normalizer.normalize("users", {
    id: 1,
    name: "rewieer",
    photos: [
      {
        id: 1,
        url: "https://someurl.com",
      },
      {
        id: 2,
        url: "https://someurl.com",
      }
    ]
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          name: "rewieer",
          photos: [1, 2],
        }
      }
    },
    photos: {
      ids: [1, 2],
      entities: {
        "1": {
          id: 1,
          url: "https://someurl.com",
        },
        "2": {
          id: 2,
          url: "https://someurl.com",
        }
      }
    }
  })
});

it("should normalize an array of data", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        photo: "photos",
      },
    }
  });

  const normalized = normalizer.normalize("users", [
    {
      id: 1,
      name: "rewieer",
      photo: {
        id: 2,
        url: "https://someurl.com",
      }
    },
    {
      id: 2,
      name: "johndoe",
      photo: {
        id: 4,
        url: "https://someurl.com",
      }
    }
  ]);

  expect(normalized).toEqual({
    users: {
      ids: [1, 2],
      entities: {
        "1": {
          id: 1,
          name: "rewieer",
          photo: 2,
        },
        "2": {
          id: 2,
          name: "johndoe",
          photo: 4,
        }
      }
    },
    photos: {
      ids: [2, 4],
      entities: {
        "2": {
          id: 2,
          url: "https://someurl.com",
        },
        "4": {
          id: 4,
          url: "https://someurl.com",
        }
      }
    }
  })
});

it("should use custom ID", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        id: "user_id",
        photo: "photos",
      },
    }
  });

  const normalized = normalizer.normalize("users", {
    user_id: 1,
    name: "rewieer",
    photo: {
      id: 2,
      url: "https://someurl.com",
    }
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          user_id: 1,
          name: "rewieer",
          photo: 2,
        }
      }
    },
    photos: {
      ids: [2],
      entities: {
        "2": {
          id: 2,
          url: "https://someurl.com",
        }
      }
    }
  })
});
it("should use custom ID of nested schemas", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        id: "user_id",
        photo: "photos",
      },
      photos: {
        id: "photo_id",
      }
    }
  });

  const normalized = normalizer.normalize("users", {
    user_id: 1,
    name: "rewieer",
    photo: {
      photo_id: 2,
      url: "https://someurl.com",
    }
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          user_id: 1,
          name: "rewieer",
          photo: 2,
        }
      }
    },
    photos: {
      ids: [2],
      entities: {
        "2": {
          photo_id: 2,
          url: "https://someurl.com",
        }
      }
    }
  })
});

it("should recognize a route", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        photo: "photos",
      },
    },
    routes: {
      "/users/1": "users",
    }
  });

  const normalized = normalizer.normalize("/users/1", {
    id: 1,
    name: "rewieer",
    photo: {
      id: 1,
      url: "https://someurl.com",
    }
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          name: "rewieer",
          photo: 1,
        }
      }
    },
    photos: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          url: "https://someurl.com",
        }
      }
    }
  })
});

it("should recognize a route with an array", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        photo: "photos",
      },
    },
    routes: {
      "/users/1": ["users"],
    }
  });

  const normalized = normalizer.normalize("/users/1", {
    id: 1,
    name: "rewieer",
    photo: {
      id: 1,
      url: "https://someurl.com",
    }
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          name: "rewieer",
          photo: 1,
        }
      }
    },
    photos: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          url: "https://someurl.com",
        }
      }
    }
  })
});


it("should recognize a route with dynamic parameters", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        photo: "photos",
      },
    },
    routes: {
      "/users/:id": ["users"],
    }
  });

  const normalized = normalizer.normalize("/users/1", {
    id: 1,
    name: "rewieer",
    photo: {
      id: 1,
      url: "https://someurl.com",
    }
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          name: "rewieer",
          photo: 1,
        }
      }
    },
    photos: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          url: "https://someurl.com",
        }
      }
    }
  })
});

it("should recognize a route with dynamic parameters and arguments", () => {
  const normalizer = new Normalizer({
    entities: {
      users: {
        photo: "photos",
      },
    },
    routes: {
      "/users/:id": ["users"],
    }
  });

  const normalized = normalizer.normalize("/users/1?foo=bar&key=stuff", {
    id: 1,
    name: "rewieer",
    photo: {
      id: 1,
      url: "https://someurl.com",
    }
  });

  expect(normalized).toEqual({
    users: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          name: "rewieer",
          photo: 1,
        }
      }
    },
    photos: {
      ids: [1],
      entities: {
        "1": {
          id: 1,
          url: "https://someurl.com",
        }
      }
    }
  })
});

