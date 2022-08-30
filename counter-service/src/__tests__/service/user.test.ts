import Axios from "axios";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.DATABASE_HOST =
  process.env.REDIS_HOST =
  process.env.RABBITMQ_HOST =
    "localhost";
process.env.AUTH_SERVICE_HOST = "http://localhost/auth";

import userService from "../../service/user.service";
import NotFoundError from "../../errors/not-found.error";
import { defaultDataSource } from "../../database";
import { User } from "../../database/entities/user";
import messenger from "../../rabbitmq/messenger";

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

const testAuthUserData = {
  first_name: "Test",
  last_name: "Test",
  email: "test@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};

const testCounterUserData = {
  sex: true,
  nickname: "test"
};

let authUser;
let counterUser;

beforeAll(async () => {
  await defaultDataSource.initialize();
});

describe("testing user service", () => {
  test("creating test user in auth service", async () => {
    authUser = (await authServiceAxios.post("/users/create", testAuthUserData))
      .data;
  });

  test("creates user in counter service", async () => {
    try {
      counterUser = await userService.createUser({
        ...testCounterUserData,
        authUserId: authUser.id
      });
    } catch (e) {
      console.dir(e.result, { depth: null });
      throw e;
    }

    expect(await userService.getUser(counterUser.id)).toBeInstanceOf(User);
    expect(await userService.getUserByUserAuthId(authUser.id)).toBeInstanceOf(
      User
    );
  });

  test("updates user in counter service", async () => {
    counterUser = await userService.updateUser(counterUser.id, {
      sex: false,
      nickname: "another"
    });

    expect(counterUser).toBeInstanceOf(User);
  });

  test("deletes user in counter service", async () => {
    expect(await userService.deleteUser(counterUser.id)).toBe(1);
  });

  test("deletes unexisting user in counter service", async () => {
    try {
      await userService.deleteUser(counterUser.id);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
    }
  });

  test("recreates user in counter service", async () => {
    counterUser = await userService.createUser({
      ...testCounterUserData,
      authUserId: authUser.id
    });

    expect(counterUser).toBeInstanceOf(User);
  });

  test("deletes user in counter service by auth user id", async () => {
    expect(await userService.deleteUserByAuthId(authUser.id)).toBe(1);

    try {
      await userService.getUser(counterUser.id);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
    }
    try {
      await userService.getUserByUserAuthId(authUser.id);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
    }
  });

  test("deletes user in auth service", async () => {
    await authServiceAxios.delete(`/users/${authUser.id}`);
  });
});

afterAll(async () => {
  await defaultDataSource.destroy();
  await messenger.disconnect();
});
