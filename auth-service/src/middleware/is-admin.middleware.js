const AuthorizationError = require("../errors/authorization.error");
const ForbiddenError = require("../errors/forbidden.error");

async function isAdmin(req, _res, next) {
  if (req.user === undefined) next(new AuthorizationError());
  else if (req.user.is_admin !== true) next(new ForbiddenError());
  else next();
}

module.exports = isAdmin;
