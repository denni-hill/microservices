const crypto = require("crypto");
const PayloadedError = require("../payloaded-error");

function getUserHash(email, password) {
  if (typeof email !== "string")
    throw new PayloadedError("Email must be type of string", { email });
  if (typeof email !== "string")
    throw new PayloadedError("Password must be type of string", { password });

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
