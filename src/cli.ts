import createHttpLink from "./client/link/createHttpLink";
import Client from "./client/Client";

const client = new Client({
  links: [
    createHttpLink({
      fetch: (url, data) => {
        console.log(url, data);
        return new Promise(a => a({}));
      }
    })
  ]
});

client.emit("https://site.com/foo/bar");
