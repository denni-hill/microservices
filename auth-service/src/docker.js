const dotenv = require("dotenv");
const path = require("path");
const app = require("./app");

if (process.env.NODE_ENV === "docker") {
  dotenv.config();
  dotenv.config({
    path: path.join(process.cwd(), "..", "services.env", ".env")
  });
}

app = require("./app");

app.start();
