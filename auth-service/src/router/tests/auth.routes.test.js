const Axios = require("axios");

const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.REDIS_HOST = "localhost";
process.env.PORT = 8085;

const server = require("../../app");
const UserService = require("../../service/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const redisClient = require("../../redis");

const axios = Axios.create({
  baseURL: "http://localhost:8085",
  headers: {
    common: {
      Accept: "*/*"
    }
  }
});

let userData = {
  first_name: "Test",
  last_name: "Test",
  email: "test@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};
let user;
let accessToken;
let refreshToken;

describe("testing auth routes", () => {
  beforeAll(async () => {
    await new Promise((resolve) => {
      server.on("listening", resolve);
    });
    await new Promise((resolve) => {
      redisClient.on("connect", resolve);
    });
    user = await UserService.createUser(userData);
  });

  test("attempting to login", async () => {
    const response = await axios.post("/login", {
      email: userData.email,
      password_hash: userData.password_hash
    });
    expect(response.status).toBe(200);
    const { accessToken: access, refreshToken: refresh } = response.data;

    accessToken = access;
    refreshToken = refresh;

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    axios.defaults.headers.common.authorization = `Bearer ${accessToken}`;
  });
  test("attempting to check access token is valid", async () => {
    const response = await axios.post("/check");
    expect(response.status).toBe(200);
  });
  test("attempting to refresh tokens", async () => {
    await new Promise((r) => setTimeout(r, 2000));
    const response = await axios.post("/refresh", refreshToken, {
      headers: {
        "content-type": "text/plain"
      }
    });
    expect(response.status).toBe(200);
    const { accessToken: access, refreshToken: refresh } = response.data;

    accessToken = access;
    refreshToken = refresh;

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    axios.defaults.headers.common.authorization = `Bearer ${accessToken}`;
  });

  test("attempting to logout", async () => {
    const response = await axios.post("/logout", refreshToken, {
      headers: {
        "content-type": "text/plain"
      }
    });
    expect(response.status).toBe(200);
  });
  test("blacklisted token validation failed", async () => {
    try {
      const response = await axios.post("/check");
    } catch (e) {
      expect(e.response.status).toBe(401);
    }
  });

  afterAll(async () => {
    server.close();
    await UserService.deleteUser(user.id);
    await redisClient.disconnect();
  });
});
