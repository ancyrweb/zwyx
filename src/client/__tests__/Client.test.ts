import Client from "../Client";
import createHttpLink from "../link/createHttpLink";
import createFakeFetch from "../testUtils/createFakeFetch";
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
      method: "GET",
    }
  });

  expect(result).toEqual({
    data: {},
    info: {
      headers: {},
      status: 200,
    }
  });
});

//
// it("should cache result", async () => {
//   const fakeFetch = createFakeFetch({ response: {} });
//   const client = new Client({
//     links: [
//       createHttpLink({
//         fetch: fakeFetch
//       })
//     ],
//     cache: new RAMCache(),
//   });
//
//   await client.emit({
//     request: {
//       url: "https://someurl.com",
//       method: "GET",
//     }
//   });
//   await client.emit({
//     request: {
//       url: "https://someurl.com",
//       method: "GET",
//     }
//   });
//
//   expect(fakeFetch).toHaveBeenCalledTimes(1);
// });
