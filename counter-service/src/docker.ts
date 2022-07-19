import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({
  path: path.join(process.cwd(), "..", "services.env", ".env")
});

import app from "./app";

app.start();
