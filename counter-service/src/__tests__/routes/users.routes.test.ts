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
  is_admin: true,
  email: "test@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};

let authUser: AuthUserData;
let userAccessToken: string;
let counterUser: User;

beforeAll(async () => {
  await app.start();
});

import userService from "../../service/user.service";

describe("tests users routes", () => {
  test("creating test user in auth service", async () => {
    authUser = (await authServiceAxios.post("/users", testUserData)).data;
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

  test("updates user", async () => {
    clientAxios.defaults.headers.common.authorization = `Bearer ${accessToken}`;

    const response = await clientAxios.put(`/users/${counterUser.id}`, {
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

  test("gets user", async () => {
    const response = await clientAxios.get(`/users/${counterUser.id}`);
    expect(response.status).toBe(200);

    counterUser = response.data;

    expect(counterUser).toMatchObject({
      id: counterUser.id
    });
  });

  test("deletes user", async () => {
    const response = await clientAxios.delete(`/users/${counterUser.id}`);

    expect(response.status).toBe(200);
  });

  test("restores user", async () => {
    const response = await clientAxios.post(`/users/restore/${counterUser.id}`);

    expect(response.status).toBe(200);
  });
});

afterAll(async () => {
  await authServiceAxios.delete(`/users/${authUser.id}`);
  await userService.deleteUser(counterUser.id, false);
  await app.stop();
});
