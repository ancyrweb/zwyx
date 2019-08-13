import Context from "./Context";

export type RawRequest = {
  request: {
    url: string;
    method?: "GET" | "POST" | "DELETE" | "PUT" | "OPTIONS" | "HEAD" | "PATCH";
    headers?: Record<string, string>;
    body?: any;
  };
  context: Context;
};

export type Request = Pick<RawRequest, "request">;
export type Response<TData extends any> = {
  data: TData;
  info: {
    status?: number;
    headers?: any;
  };
};
