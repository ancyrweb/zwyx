import React from "react";
import { HTTPMethod } from "zwyx/dist/client/types";
import { NormalizedPathIDs } from "zwyx/dist/client/normalizer/NormalizationProcess";
import { Client } from "zwyx";
import SubscribeableCacheInterface from "zwyx/dist/client/cache/SubscribeableCacheInterface";
import withZwyx from "./withZwyx";

export type ComponentConfig<TDataType extends object> = {
  loading: boolean;
  error: Error | null;
  data: TDataType | null;
};

export type CachePolicy =
  | "network-only" // Always fetch from the network. Data will be cached anyway
  | "cache-only" // Always fetch from the cache
  | "cache-and-network" // Give data from the cache but also make a network request
  | "network-if-not-cached"; // Only fetch if the data isn't cached

type RequestProps<TDataType extends object = {}> = {
  url: string;
  method?: HTTPMethod;
  body?: any;
  headers?: Record<string, string>;
  children: (config: ComponentConfig<TDataType>) => React.ReactNode;
  cachePolicy?: CachePolicy;
};

type Props<TDataType extends object> = {
  zwyx: Client;
} & RequestProps<TDataType>;

type State<TDataType extends object> = {
  loading: boolean;
  error: Error | null;
  data: TDataType | null;
};

const subscribeableKeys = (pathIds: NormalizedPathIDs) => {
  const keys = [];
  Object.keys(pathIds).forEach(key => {
    const cacheEntityName = pathIds[key].schema;
    pathIds[key].values.forEach(val => {
      const cacheKey = cacheEntityName + ":" + val;
      if (keys.indexOf(cacheKey) === -1) {
        keys.push(cacheKey);
      }
    });
  });
  return keys;
};

const buildEntities = (
  ids: any[] | any,
  schema: string,
  cache: SubscribeableCacheInterface
) => {
  if (Array.isArray(ids)) {
    return ids.map(id => cache.get(schema + ":" + id));
  } else {
    return cache.get(schema + ":" + ids);
  }
};

const recursivelyBuildEntities = (
  data: any,
  cache: SubscribeableCacheInterface
) => {
  if (typeof data.ids !== "undefined" && typeof data.schema !== "undefined") {
    return buildEntities(data.ids, data.schema, cache);
  }

  let obj = {};
  for (let key in data) {
    obj[key] = recursivelyBuildEntities(data[key], cache);
  }

  return obj;
};

class Request<TDataType extends object> extends React.Component<
  Props<TDataType>,
  State<TDataType>
> {
  private requestCacheSubscription = null;
  private entitiesCacheSubscription = null;
  private isRequesting = false;

  static defaultProps = {
    cachePolicy: "cache-and-network" as CachePolicy
  };

  state = {
    loading: false,
    error: null,
    data: null
  };

  createRequest = () => ({
    url: this.props.url,
    method: this.props.method,
    body: this.props.body,
    headers: this.props.headers
  });

  fetch = async () => {
    this.isRequesting = true;
    this.setState({ loading: true, error: null });
    try {
      const result = await this.props.zwyx.emit<TDataType>({
        request: this.createRequest()
      });

      if (result.data) {
        this.subscribeToEntities(subscribeableKeys(result.data.pathIds));
      }

      this.setState({ data: result.raw, loading: false });
    } catch (e) {
      this.setState({ loading: false, error: e });
    }

    this.isRequesting = false;
  };

  subscribeToURL = () => {
    if (this.requestCacheSubscription) {
      this.requestCacheSubscription();
    }

    const requestCacheKey = this.props.zwyx
      .getCacheManager()
      .createRequestCacheKey(this.createRequest());
    this.props.zwyx
      .getCache()
      .subscribe(requestCacheKey, this.onRequestChange.bind(this));
  };

  subscribeToEntities = (keys: string[]) => {
    if (this.entitiesCacheSubscription) {
      this.entitiesCacheSubscription();
    }

    this.props.zwyx
      .getCache()
      .subscribe(keys, this.onEntitiesChange.bind(this));
  };

  reflectCacheToState = () => {
    const requestCacheKey = this.props.zwyx
      .getCacheManager()
      .createRequestCacheKey(this.createRequest());
    const localData = this.props.zwyx.getCache().get(requestCacheKey);

    if (!localData) {
      return;
    }

    if (localData.$root) {
      this.setState({
        data: buildEntities(
          localData.$root.ids,
          localData.$root.schema,
          this.props.zwyx.getCache()
        )
      });
    } else {
      this.setState({
        data: recursivelyBuildEntities(localData, this.props.zwyx.getCache())
      });
    }
  };

  onRequestChange = () => {
    if (this.isRequesting) return;

    this.reflectCacheToState();
  };

  onEntitiesChange = async () => {
    this.reflectCacheToState();
  };

  componentDidMount(): void {
    this.subscribeToURL();
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
