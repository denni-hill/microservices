const AuthService = require("../service/auth");
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
  const authorizationHeader = req.headers["authorization"];
  if (
    typeof authorizationHeader !== "string" ||
    !authorizationHeader.startsWith("Bearer ")
  )
    return res
      .status(401)
      .send("Authorization header is required to be bearer access token");

  const accessToken = authorizationHeader.replace("Bearer ", "");
  let user;
  try {
    user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    return res.status(401).send("Access token is invalid");
  }

  let conditions;
  try {
    conditions = await Promise.all([
      AuthService.isAccessTokenBlacklisted(accessToken),
      AuthService.isUserIdBlacklisted(user.id)
    ]);
  } catch (e) {
    res.status(500).send();

    next(e);
  }

  if (conditions.some((cond) => cond))
    return res
      .status(401)
      .send("Access token is blacklisted or/and user is deleted");

  req.user = { ...user, accessToken };

  next();
}

module.exports = auth;
