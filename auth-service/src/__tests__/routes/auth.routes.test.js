const Axios = require("axios");

const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.REDIS_HOST =
  process.env.RABBITMQ_HOST =
  process.env.ELK_HOST =
    "localhost";
process.env.PORT = 8085;

const app = require("../../app");
const UserService = require("../../service/user.service");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/**
 * @type { import("axios").Axios }
 */
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
const tokens = [];
let accessToken;
let refreshToken;

beforeAll(async () => {
  await app.start();
  user = await UserService.createUser(userData);
});

describe("testing auth routes", () => {
  test("attempting to login", async () => {
    const response = await axios.post("/login", {
      email: userData.email,
      password_hash: userData.password_hash
    });
    expect(response.status).toBe(200);
    const { accessToken, refreshToken } = response.data;

    tokens.push({ accessToken, refreshToken });

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    axios.defaults.headers.common.authorization = `Bearer ${accessToken}`;
  });

  test("attempting to check access token is valid", async () => {
    let response = await axios.post("/check");
    expect(response.status).toBe(200);
    response = await axios.post(
      "/service-check",
      tokens[tokens.length - 1].accessToken,
      {
        headers: {
          "content-type": "text/plain"
        }
      }
    );
    expect(response.status).toBe(200);
  });

  test("attempting to refresh tokens", async () => {
    const response = await axios.post(
      "/refresh",
      tokens[tokens.length - 1].refreshToken,
      {
        headers: {
          "content-type": "text/plain"
        }
      }
    );
    expect(response.status).toBe(200);
    const { accessToken, refreshToken } = response.data;

    tokens.push({ accessToken, refreshToken });

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    axios.defaults.headers.common.authorization = `Bearer ${accessToken}`;
  });

  test("fails to refresh with used refresh token", async () => {
    try {
      await axios.post("/refresh", tokens[tokens.length - 2].refreshToken, {
        headers: {
          "content-type": "text/plain"
        }
      });
    } catch (e) {
      expect(e.response.status).toBe(404);
    }
  });

  test("attempting to logout", async () => {
    const response = await axios
      .post("/logout", tokens[tokens.length - 1].refreshToken, {
        headers: {
          "content-type": "text/plain"
        }
      })
      .catch((e) => console.log(e.response.data));
    expect(response.status).toBe(200);
  });
  test("blacklisted token validation failed", async () => {
    try {
      await axios.post("/check");
    } catch (e) {
      expect(e.response.status).toBe(401);
    }

    try {
      await axios.post(
        "/service-check",
        tokens[tokens.length - 1].accessToken,
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );
    } catch (e) {
      expect(e.response.status).toBe(401);
    }
  });

  test("deletes test user", async () => {
    expect(await UserService.deleteUser(user.id)).toBe(1);
  });
});

afterAll(async () => {
  await app.stop();
});
