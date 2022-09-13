import Axios from "axios";
import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import crypto from "crypto";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.DATABASE_HOST =
  process.env.REDIS_HOST =
  process.env.RABBITMQ_HOST =
  process.env.ELK_HOST =
    "localhost";
process.env.AUTH_SERVICE_HOST = "http://localhost/auth";

import { defaultDataSource } from "../../database";
import userService from "../../service/user.service";
import { User } from "../../database/entities/user.entity";
import counterService from "../../service/counter.service";
import { Counter } from "../../database/entities/counter.entity";
import { CounterParticipant } from "../../database/entities/counter-participant.entity";
import { ConflictError } from "../../errors/conflict.error";
import messenger from "../../rabbitmq/messenger";
import ForbiddenError from "../../errors/forbidden.error";

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

const anotherAuthUserData = {
  first_name: "Test",
  last_name: "Test",
  email: "another@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};

const testCounterUserData = {
  sex: true,
  nickname: "test"
};

const anotherCounterUserData = {
  sex: true,
  nickname: "another"
};

let authUser: AuthUserData;
let secondAuthUser: AuthUserData;
let counterUser: User;
let secondCounterUser: User;
let counter: Counter;

beforeAll(async () => {
  await defaultDataSource.initialize();
  await messenger.connect();
});

describe("test counter service", () => {
  test("creating test user in auth service", async () => {
    authUser = (await authServiceAxios.post("/users/create", testAuthUserData))
      .data;

    secondAuthUser = (
      await authServiceAxios.post("/users/create", anotherAuthUserData)
    ).data;
  });

  test("creates user in counter service", async () => {
    try {
      counterUser = await userService.createUser({
        ...testCounterUserData,
        authUserId: authUser.id
      });

      secondCounterUser = await userService.createUser({
        ...anotherCounterUserData,
        authUserId: secondAuthUser.id
      });
    } catch (e) {
      console.dir(e, { depth: null });
      throw e;
    }

    expect(await userService.getUser(counterUser.id)).toBeInstanceOf(User);
    expect(await userService.getUserByUserAuthId(authUser.id)).toBeInstanceOf(
      User
    );
  });

  test("creates counter", async () => {
    try {
      counter = await counterService.createCounter({
        name: "Test counter",
        description: "This is a test counter",
        owner: counterUser.id
      });

      expect(counter).toBeInstanceOf(Counter);
      expect(counter).toMatchObject({
        name: "Test counter",
        description: "This is a test counter",
        owner: {
          id: counterUser.id
        }
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });

  test("updates counter", async () => {
    counter = await counterService.updateCounter(counter.id, {
      name: "Updated test counter",
      description: "This is an updated test counter",
      owner: secondCounterUser.id
    });

    expect(counter).toBeInstanceOf(Counter);
    expect(counter).toMatchObject({
      name: "Updated test counter",
      description: "This is an updated test counter",
      owner: {
        id: secondCounterUser.id
      }
    });
  });

  test("get counter", async () => {
    counter = await counterService.getCounter(counter.id);
    expect(counter).toBeInstanceOf(Counter);
  });

  test("checks if owner is counter participant", async () => {
    const answer = await counterService.isUserCounterParticipant(
      counterUser.id,
      counter.id
    );

    expect(answer).toBe(true);

    const secondUserAnswer = await counterService.isUserCounterParticipant(
      secondCounterUser.id,
      counter.id
    );

    expect(secondUserAnswer).toBe(true);
  });

  test("checks if user is counter owner", async () => {
    const answer = await counterService.isUserCounterOwner(
      counterUser.id,
      counter.id
    );

    expect(answer).toBe(false);

    const secondUserAnswer = await counterService.isUserCounterOwner(
      secondCounterUser.id,
      counter.id
    );

    expect(secondUserAnswer).toBe(true);
  });

  test("updates counter", async () => {
    counter = await counterService.updateCounter(counter.id, {
      name: "Updated test counter",
      description: "This is an updated test counter",
      owner: counterUser.id
    });

    expect(counter).toBeInstanceOf(Counter);
    expect(counter).toMatchObject({
      name: "Updated test counter",
      description: "This is an updated test counter",
      owner: {
        id: counterUser.id
      }
    });
  });

  test("removes user from counter participants", async () => {
    const affected = await counterService.removeParticipant(
      counter.id,
      secondCounterUser.id
    );

    expect(affected).toBe(1);
  });

  test("adds user to counter participants", async () => {
    const participant = await counterService.addParticipant(
      counter.id,
      secondCounterUser.id
    );

    expect(participant).toBeInstanceOf(CounterParticipant);
    expect(participant).toMatchObject({
      counter: {
        id: counter.id
      },
      user: {
        id: secondCounterUser.id
      }
    });
  });

  test("checks if user is counter participant", async () => {
    const answer = await counterService.isUserCounterParticipant(
      secondCounterUser.id,
      counter.id
    );

    expect(answer).toBe(true);
  });

  test("removes user from counter participants", async () => {
    const affected = await counterService.removeParticipant(
      counter.id,
      secondCounterUser.id
    );

    expect(affected).toBe(1);
  });

  test("checks if user is counter participant", async () => {
    const answer = await counterService.isUserCounterParticipant(
      secondCounterUser.id,
      counter.id
    );

    expect(answer).toBe(false);
  });

  test("fails to remove counter owner from participants", async () => {
    try {
      await counterService.removeParticipant(counter.id, counterUser.id);
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenError);
    }
  });

  test("adds user to counter participants, but user already participates", async () => {
    try {
      await counterService.addParticipant(counter.id, counterUser.id);
    } catch (e) {
      expect(e).toBeInstanceOf(ConflictError);
    }
  });

  test("deletes counter", async () => {
    await counterService.deleteCounter(counter.id);
  });

  test("deletes counter users", async () => {
    await userService.deleteUser(counterUser.id, false);
    await userService.deleteUser(secondCounterUser.id, false);
  });
});

afterAll(async () => {
  await defaultDataSource.destroy();
  await messenger.disconnect();
  await authServiceAxios.delete(`/users/${authUser.id}`);
  await authServiceAxios.delete(`/users/${secondAuthUser.id}`);
});
