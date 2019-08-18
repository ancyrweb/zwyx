import Context from "./Context";

export type HTTPMethod =
  | "GET"
  | "POST"
  | "DELETE"
  | "PUT"
  | "OPTIONS"
  | "HEAD"
  | "PATCH";
export type HTTPRequest = {
  url: string;
  method?: HTTPMethod;
  headers?: Record<string, string>;
  body?: any;
};

export type RawRequest = {
  request: HTTPRequest;
  context: Context;
};

export type Request = Pick<RawRequest, "request">;
export type Response<TData extends any> = {
  data: TData;
  info: ResponseInfo;
};

export type ResponseInfo = {
  status?: number;
  headers?: any;
};
