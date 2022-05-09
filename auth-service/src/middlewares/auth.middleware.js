const AuthService = require("../service/auth");
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
  try {
    const token = req.headers["authorization"].replace("Bearer ", "");
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const conditions = await Promise.all([
      AuthService.isAccessTokenBlacklisted(token),
      AuthService.isUserIdBlacklisted(user.id)
    ]);

    if (conditions.some((cond) => cond)) return res.status(401).send();
    else req.user = user;
  } catch (e) {
    res.status(401).send();
    throw e;
  }

  next();
}

module.exports = auth;
