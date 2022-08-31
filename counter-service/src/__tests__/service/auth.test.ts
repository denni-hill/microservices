import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Axios from "axios";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.DATABASE_HOST =
  process.env.REDIS_HOST =
  process.env.RABBITMQ_HOST =
  process.env.ELK_HOST =
    "localhost";
process.env.AUTH_SERVICE_HOST = "http://localhost/auth";

import authService from "../../service/auth.service";
import InternalServerError from "../../errors/internal.error";

const accessToken = jwt.sign(
  {
    is_admin: true,
    isInternalServiceToken: true
  },
  process.env.ACCESS_TOKEN_SECRET,
  { issuer: process.env.DOMAIN }
);

const authServiceAxios = Axios.create({
  baseURL: process.env.AUTH_SERVICE_HOST,
  headers: {
    authorization: "Bearer " + accessToken,
    accept: "*/*"
  }
});

const testUserData = {
  first_name: "Test",
  last_name: "Test",
  email: "test@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};

let authUser;
let userAccessToken: string;

describe("Test auth service", () => {
  test("checks if user exists in auth service", async () => {
    try {
      expect(await authService.isAuthUserExist(999)).toBe(false);
    } catch (e) {
      if (e instanceof InternalServerError) {
        throw e.error;
      }
    }
  });

  test("creates user in auth service", async () => {
    try {
      authUser = (
        await authServiceAxios.post("/users/create", { ...testUserData })
      ).data;
    } catch (e) {
      throw e;
    }
  });

  test("checks if user exists in auth service", async () => {
    expect(await authService.isAuthUserExist(authUser.id)).toBe(true);
  });

  test("attempt to login", async () => {
    const { accessToken: responseAccessToken } = (
      await authServiceAxios.post("/login", {
        email: testUserData.email,
        password_hash: testUserData.password_hash
      })
    ).data;

    userAccessToken = responseAccessToken;
  });

  test("check if access token valid", async () => {
    expect(await authService.isAccessTokenValid(userAccessToken)).toBe(true);
  });

  test("deletes user in auth service", async () => {
    await authServiceAxios.delete(`/users/${authUser.id}`);
  });
});
