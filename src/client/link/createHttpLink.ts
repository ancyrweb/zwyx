import Observable from "zen-observable";
import { RawRequest, Response } from "../types";

export type HttpFetch = (url: string, data: any) => Promise<any>;
export type HttpLinkConfig = {
  fetch: HttpFetch;
};

const findFetch = (config?: HttpLinkConfig): HttpFetch => {
  const configFetch = config ? config.fetch : null;
  // @ts-ignore
  return configFetch || global.fetch;
};

const createResponse = <T extends any>(response: {
  data: T;
  status: number;
  headers: any;
}): Response<T> => {
  return {
    data: response.data,
    info: {
      status: response.status,
      headers: response.headers
    }
  };
};

// TODO : merge similar simultaneous HTTP requests
const createHttpLink = (config?: HttpLinkConfig) => {
  const fetch = findFetch(config);
  if (!fetch) {
    throw new Error("fetch isn't defined.");
  }

  return (data: RawRequest) => {
    const { url, ...request } = data.request;
    if (typeof url !== "string") {
      throw new Error("You must provide a url");
    }

    if (!request.method) {
      request.method = "GET";
    }

    return new Observable(obs => {
      fetch(url, request)
        .then(r => {
          return r.json().then(json =>
            createResponse({
              status: r.status,
              headers: r.headers,
              data: json
            })
          );
        })
        .then(obj => {
          obs.next(obj);
          obs.complete();
        })
        .catch(obs.error.bind(obs));
    });
  };
};

export default createHttpLink;
