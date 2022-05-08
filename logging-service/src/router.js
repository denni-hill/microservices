const KoaRouter = require("@koa/router");
const logger = require("./logger");
const jwt = require("jsonwebtoken");
const koaBody = require("koa-body");

const router = new KoaRouter();

router.get("/", (ctx) => {
  ctx.status = 200;
});

router.post("/", (ctx) => {
  try {
    const { log, sender: iss } = ctx.request.body.data;
    logger.log({ ...log, sender: iss });
    ctx.status = 200;
  } catch (e) {
    logger.log({
      sender: "logging-service",
      errors: [e.message],
      warnings: []
    });

    ctx.status = e.status;
    ctx.body = e.message;
  }
});

module.exports = router;
