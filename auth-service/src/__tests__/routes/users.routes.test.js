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
  baseURL: `http://localhost:${process.env.PORT}`,
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
let tokens = { accessToken: undefined, refreshToken: undefined };

let anotherUserData = {
  first_name: "Test",
  last_name: "Test",
  email: "another@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};
let createdUser;

beforeAll(async () => {
  await app.start();
});

describe("testing users routes", () => {
  test("attempting to register", async () => {
    let response;
    try {
      response = await axios.post("/users/register", userData);
    } catch (e) {
      if (process.env.REGISTRATION_ENABLED !== "true")
        expect(e.response.data).toBe("REGISTRATION IS DISABLED");
      else throw e;
    }

    user = response.data;
  });

  test("attempting to create user", async () => {
    try {
      let response = await axios.post("/users", anotherUserData);

      throw new Error("Request succeed unexpectedly!");
    } catch (e) {
      if (e.response !== undefined) expect(e.response.status).toBe(401);
      else throw e;
    }
  });

  test("attempting to update user", async () => {
    try {
      let response = await axios.patch(`/users/${1}`, {
        first_name: "Changed"
      });

      throw new Error("Request succeed unexpectedly!");
    } catch (e) {
      if (e.response !== undefined) expect(e.response.status).toBe(401);
      else throw e;
    }
  });

  test("attempting to delete user", async () => {
    try {
      let response = await axios.delete(`/users/${1}`);

      throw new Error("Request succeed unexpectedly!");
    } catch (e) {
      if (e.response !== undefined) expect(e.response.status).toBe(401);
      else throw e;
    }
  });

  test("attempting to login", async () => {
    const response = await axios.post("/login", {
      email: userData.email,
      password_hash: userData.password_hash
    });
    expect(response.status).toBe(200);
    const { accessToken, refreshToken } = response.data;

    tokens = { accessToken, refreshToken };

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    axios.defaults.headers.common.authorization = `Bearer ${accessToken}`;
  });

  test("attempting to create user", async () => {
    try {
      let response = await axios.post("/users", anotherUserData);

      throw new Error("Request succeed unexpectedly!");
    } catch (e) {
      if (e.response !== undefined) expect(e.response.status).toBe(403);
      else throw e;
    }
  });

  test("attempting to update user", async () => {
    try {
      let response = await axios.patch(`/users/${1}`, {
        first_name: "Changed"
      });

      throw new Error("Request succeed unexpectedly!");
    } catch (e) {
      if (e.response !== undefined) expect(e.response.status).toBe(403);
      else throw e;
    }
  });

  test("attempting to delete user", async () => {
    try {
      let response = await axios.delete(`/users/${1}`);

      throw new Error("Request succeed unexpectedly!");
    } catch (e) {
      if (e.response !== undefined) expect(e.response.status).toBe(403);
      else throw e;
    }
  });

  test("attempting to logout", async () => {
    try {
      await axios.post("/logout", tokens.refreshToken, {
        headers: {
          "content-type": "text/plain"
        }
      });
    } catch (e) {
      console.log(e.response.data);
      throw e;
    }
  });

  test("attempting to make test user admin", async () => {
    user = await UserService.updateUser(user.id, { is_admin: true });
  });

  test("attempting to login", async () => {
    const response = await axios.post("/login", {
      email: userData.email,
      password_hash: userData.password_hash
    });
    expect(response.status).toBe(200);
    const { accessToken, refreshToken } = response.data;

    tokens = { accessToken, refreshToken };

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    axios.defaults.headers.common.authorization = `Bearer ${accessToken}`;
  });

  test("attempting to create user", async () => {
    let response = await axios.post("/users", anotherUserData);

    expect(response.status).toBe(201);

    createdUser = response.data;
  });

  test("attempting to update user", async () => {
    let response = await axios.patch(`/users/${createdUser.id}`, {
      first_name: "Changed"
    });

    expect(response.status).toBe(200);
    expect(response.data.first_name).toBe("Changed");
  });

  test("attempting to delete user", async () => {
    let response = await axios.delete(`/users/${createdUser.id}`);

    expect(response.status).toBe(200);

    await UserService.deleteUser(user.id);
  });
});

afterAll(async () => {
  await app.stop();
});
