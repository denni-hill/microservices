const crypto = require("crypto");
const InternalServerError = require("../errors/internal.error");

function getUserHash(email, password) {
  if (typeof email !== "string")
    throw new InternalServerError("Email must be type of string");
  if (typeof email !== "string")
    throw new InternalServerError("Password must be type of string");

  const emailHash = crypto.createHash("sha256").update(email).digest("hex");
  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  return crypto
    .createHash("sha256")
    .update(emailHash + passwordHash)
    .digest("hex");
}

module.exports = getUserHash;
