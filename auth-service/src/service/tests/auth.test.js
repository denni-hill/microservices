const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.REDIS_HOST = "localhost";

const UserService = require("../user");
const AuthService = require("../auth");
const redisClient = require("../../redis");

const userData = {
  email: "test@test.com",
  password_hash: crypto
    .createHash("sha256")
    .update("123321qwerty")
    .digest("hex"),
  first_name: "Denis",
  last_name: "Saenko"
};

let user;
let userAccessToken;
let userRefreshToken;

describe("Test auth service", () => {
  beforeAll(async () => {
    await redisClient.connect();
  });

  test("creates user for testing", async () => {
    user = await UserService.createUser(userData);
  });

  test("attempt to login user", async () => {
    const { accessToken, refreshToken } = await AuthService.login({
      email: user.email,
      password_hash: userData.password_hash
    });

    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));

    userAccessToken = accessToken;
    userRefreshToken = refreshToken;

    jwt.verify(userAccessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  });

  test("attempt to use refresh token", async () => {
    await new Promise((r) => setTimeout(r, 2000));
    const { accessToken, refreshToken } = await AuthService.refresh(
      userAccessToken,
      userRefreshToken
    );

    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));

    expect(await AuthService.isAccessTokenBlacklisted(userAccessToken)).toBe(
      true
    );

    try {
      await AuthService.refresh(userAccessToken, userRefreshToken);
    } catch (e) {
      expect(e.message).toBe("Refresh token is not found");
    }

    userAccessToken = accessToken;
    userRefreshToken = refreshToken;

    jwt.verify(userAccessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  });

  test("checks access token", async () => {
    expect(await AuthService.isAccessTokenBlacklisted(userAccessToken)).toBe(
      false
    );
  });

  test("attempt to logout", async () => {
    await AuthService.logout(userAccessToken, userRefreshToken);
  });

  test("checks access token to be blacklisted", async () => {
    expect(await AuthService.isAccessTokenBlacklisted(userAccessToken)).toBe(
      true
    );
  });

  test("deletes test user", async () => {
    UserService.deleteUser(user.id);
  });

  afterAll(async () => {
    redisClient.disconnect();
  });
});
