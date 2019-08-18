import React from "react";
import { HTTPRequest } from "zwyx/dist/client/types";
import Request, { ComponentConfig } from "./Request";

export type RequestConfig<TName extends string> = {
  name: TName;
  request: HTTPRequest;
};

export type ComponentProps<TName extends string, TDataType extends object> = {
  [P in TName]: ComponentConfig<TDataType>;
};

const withRequest = <TName extends string, TDataType extends object>(
  config: RequestConfig<TName>
) => (
  Component: React.ComponentType<ComponentProps<TName, TDataType>>
) => props => {
  return (
    <Request
      url={config.request.url}
      method={config.request.method}
      body={config.request.body}
      headers={config.request.headers}
    >
      {data => {
        const componentProps = {
          ...props,
          [config.name]: data
        };

        return <Component {...componentProps} />;
      }}
    </Request>
  );
};

export default withRequest;
