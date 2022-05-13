const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({
  path: path.join(process.cwd(), "..", "services.env", ".env")
});

const app = require("./app");

app.start();
