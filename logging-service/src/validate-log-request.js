const { build, validate } = require("chain-validator-js");

async function validateLogRequestMiddleware(ctx, next) {
  try {
    jwt.verify(ctx.request.body.data, process.env.JWT_SECRET);
  } catch {
    ctx.body = 403;
    ctx.body = "Token verification failed";
    return;
  }

  const validationResult = await validate(
    ctx.request.body.data,
    build().schema({
      aud: build().isString().equals("logging-service"),
      log: build(),
      iss: build().isString()
    })
  );

  if (validationResult.failed) {
    ctx.status = 400;
    ctx.body = "Invalid token structure";
    return;
  }

  ctx.request.body.data = validationResult.validated;

  next();
}

module.exports = {
  validateLogRequestMiddleware
};
