import Router from "@koa/router";
import { AppContext, AppState } from "../app-types";

import cvRouter from "./cv";

const router = new Router<AppState, AppContext>();

router.use(cvRouter.middleware());

export default router;
