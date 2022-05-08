const Koa = require("koa");
const router = require("./router");
const dotenv = require("dotenv");
const path = require("path");
const koaBody = require("koa-body");
const validateLogRequestMiddleware = require("./validate-log-request");

const app = new Koa();

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", "services.env", ".env") });

app.use(koaBody(), validateLogRequestMiddleware);

app.use(router.middleware());

app.listen(80, () => console.log("logging service started"));
