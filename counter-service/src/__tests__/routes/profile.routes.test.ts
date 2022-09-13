import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Axios, { AxiosInstance } from "axios";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.DATABASE_HOST =
  process.env.REDIS_HOST =
  process.env.RABBITMQ_HOST =
  process.env.ELK_HOST =
    "localhost";
process.env.AUTH_SERVICE_HOST = "http://localhost/auth";
process.env.PORT = "8080";

import app from "../../app";
import userService from "../../service/user.service";

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

let clientAxios: AxiosInstance;

const testUserData = {
  first_name: "Test",
  last_name: "Test",
  email: "test@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};

let authUser: AuthUserData;
let userAccessToken: string;
let counterUser: User;

beforeAll(async () => {
  await app.start();
});

describe("tests profiles routes", () => {
  test("creating test user in auth service", async () => {
    authUser = (await authServiceAxios.post("/users/create", testUserData))
      .data;
  });

  test("attempt to login", async () => {
    const { accessToken: responseAccessToken } = (
      await authServiceAxios.post("/login", {
        email: testUserData.email,
        password_hash: testUserData.password_hash
      })
    ).data;

    userAccessToken = responseAccessToken;

    clientAxios = Axios.create({
      baseURL: `http://localhost:${process.env.PORT}`,
      headers: {
        authorization: "Bearer " + userAccessToken,
        accept: "*/*"
      }
    });
  });

  test("register user in counter service", async () => {
    const response = await clientAxios.post("/users/register", {
      nickname: "test",
      sex: true
    });

    expect(response.status).toBe(201);

    counterUser = response.data;

    expect(counterUser).toMatchObject({
      nickname: "test",
      sex: true
    });
  });

  test("update profile", async () => {
    const response = await clientAxios.put("/profile", {
      nickname: "another",
      sex: false
    });

    expect(response.status).toBe(200);

    counterUser = response.data;

    expect(counterUser).toMatchObject({
      nickname: "another",
      sex: false
    });
  });

  test("get profile", async () => {
    const response = await clientAxios.get("/profile");

    expect(response.status).toBe(200);

    counterUser = response.data;

    expect(counterUser).toMatchObject({
      nickname: "another",
      sex: false
    });
  });
});

afterAll(async () => {
  await authServiceAxios.delete(`/users/${authUser.id}`);
  await userService.deleteUser(counterUser.id, false);
  await app.stop();
});
