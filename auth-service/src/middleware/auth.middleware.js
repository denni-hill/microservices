const AuthService = require("../service/auth.service");
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

  try {
    if (!(await AuthService.isAccessTokenValid(accessToken))) {
      return res.status(401).send("Access token is invalid");
    }
  } catch (e) {
    return next(e);
  }

  let user;
  try {
    user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    return res.status(401).send("Access token is invalid");
  }

  req.user = { ...user, accessToken };

  next();
}

module.exports = auth;
