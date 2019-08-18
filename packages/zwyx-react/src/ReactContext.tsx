import React from "react";
import { Client } from "zwyx";

type ContextValue = {
  client?: Client;
};

let ctx: React.Context<ContextValue>;

export const getContext = () => (!ctx ? resetContext() : ctx);
export const resetContext = () => {
  ctx = React.createContext<ContextValue>({});
  return ctx;
};
