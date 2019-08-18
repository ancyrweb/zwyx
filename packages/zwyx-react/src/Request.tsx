import React from "react";
import { HTTPMethod } from "zwyx/dist/client/types";
import { Client } from "zwyx";
import withZwyx from "./withZwyx";

export type ComponentConfig<TDataType extends object> = {
  loading: boolean;
  error: Error | null;
  data: TDataType | null;
};

export type CachePolicy =
  "network-only" |            // Always fetch from the network. Data will be cached anyway
  "cache-only" |              // Always fetch from the cache
  "cache-and-network" |       // Give data from the cache but also make a network request
  "network-if-not-cached";    // Only fetch if the data isn't cached

type RequestProps<TDataType extends object = {}> = {
  url: string;
  method?: HTTPMethod;
  body?: any;
  headers?: Record<string, string>;
  children: (config: ComponentConfig<TDataType>) => React.ReactNode;
  cachePolicy: CachePolicy
};

type Props<TDataType extends object> = {
  zwyx: Client;
} & RequestProps<TDataType>;

type State<TDataType extends object> = {
  loading: boolean;
  error: Error | null;
  data: TDataType | null;
};

class Request<TDataType extends object> extends React.Component<
  Props<TDataType>,
  State<TDataType>
> {
  static defaultProps = {
    cachePolicy: "cache-and-network" as CachePolicy
  };

  state = {
    loading: false,
    error: null,
    data: null
  };

  fetch = async () => {
    this.setState({ loading: true, error: null });
    try {
      const result = await this.props.zwyx.emit<TDataType>({
        request: {
          url: this.props.url,
          method: this.props.method,
          body: this.props.body,
          headers: this.props.headers
        }
      });

      // Normalization isn't provided, we store data in local state
      if (!result.data) {
        this.setState({ data: result.raw, loading: false });
        return;
      }

      this.setState({ loading: false });
    } catch (e) {
      this.setState({ loading: false, error: e });
    }
  };

  componentDidMount(): void {
    this.fetch();
  }

  render() {
    const data: ComponentConfig<TDataType> = {
      loading: this.state.loading,
      data: this.state.data,
      error: this.state.error
    };

    return this.props.children(data);
  }
}

export default withZwyx<RequestProps>(Request);
