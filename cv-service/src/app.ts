import Koa from "koa";
import responseTime from "koa-response-time";
import dotenv from "dotenv";
import sourceMapSupport from "source-map-support";
import { config as configAuth } from "./axios";
import loggerMiddleware from "./middleware/logger";
import { AppContext, AppState } from "./app-types";
import router from "./router";
import path from "path";
import { defaultDataSource } from "./database";

sourceMapSupport.install();
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", "services.env", ".env") });

configAuth();

defaultDataSource.initialize();

const app = new Koa<AppState, AppContext>();

app.use(responseTime());
app.use(loggerMiddleware);
app.use(router.middleware());

app.listen(80, () => console.log("cv service started"));
