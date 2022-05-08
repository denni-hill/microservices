import { Middleware } from "koa";
import jwt from "jsonwebtoken";
import { JWTokens } from "../../axios";
import { AppContext, AppState, PayloadedError } from "../../app-types";
import axios from "axios";
import { LoggerData } from "./loggerContext";

const loggerMiddleware: Middleware<AppState, AppContext> = async (
  ctx,
  next
) => {
  ctx.logger = new LoggerData();
  ctx.logger.url = `${ctx.request.method.toUpperCase()} ${ctx.request.url}`;

  let unhandledException = undefined;

  try {
    await next();
  } catch (e) {
    ctx.logger.errors.push(e);
    ctx.logger.body = ctx.body;

    if (e instanceof PayloadedError) {
      ctx.status = e.status;
      ctx.body = {
        msg: e.message,
        payload: e.payload
      };
    } else {
      ctx.status = 500;
      ctx.body = "Internal Server Error";
      unhandledException = e;
    }
  }

  ctx.logger.status = ctx.status;
  ctx.logger.responseTime = ctx.headers["X-Response-Time"] as string;

  await log({ log: { ...ctx.logger, timestamp: new Date() } });

  if (unhandledException !== undefined) console.error(unhandledException);
};

export async function log(data: object) {
  try {
    await axios.post("http://logging-service", {
      data: jwt.sign({ ...data }, JWTokens.secret, {
        issuer: "cv-service",
        expiresIn: "30s",
        audience: "logging-service"
      })
    });
  } catch (e) {
    if (e.response === undefined)
      console.error("Logging server is not responding");
    else console.error(`Logging service response: ${e.response.data}`);
  }
}

export default loggerMiddleware;
