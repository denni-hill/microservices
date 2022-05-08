import Koa from "koa";
import { IUserAppContext } from "./middleware/auth/user";
import { ILoggerAppContext } from "./middleware/logger/loggerContext";

export type AppState = Koa.DefaultState;
export type AppContext = Koa.DefaultContext &
  IUserAppContext &
  ILoggerAppContext;

export class PayloadedError extends Error {
  payload: unknown;
  status = 500;

  constructor(
    message?: string,
    options?: { payload?: unknown; status: number }
  ) {
    super(message);
    if (options !== undefined) {
      if (options.payload !== undefined) this.payload = options.payload;
      if (options.status !== undefined) this.status = options.status;
    }
  }
}
