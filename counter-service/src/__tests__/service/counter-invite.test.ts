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
import { CounterInvite } from "../../database/entities/counter-invite.entity";
import counterInviteService from "../../service/counter-invite.service";
import counterInviteDao from "../../dao/counter-invite.dao";

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
let invite: CounterInvite;

beforeAll(async () => {
  await defaultDataSource.initialize();
});

describe("test counter invite service", () => {
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

  test("creates invite to counter", async () => {
    invite = await counterInviteService.createInvite(
      counter.id,
      `${secondCounterUser.nickname}#${secondCounterUser.digits}`
    );

    expect(invite).toBeInstanceOf(CounterInvite);
    expect(invite).toMatchObject({
      counter: {
        id: counter.id
      },
      user: {
        id: secondCounterUser.id
      }
    });
  });

  test("fails to create existing invite to counter", async () => {
    try {
      await counterInviteService.createInvite(
        counter.id,
        `${secondCounterUser.nickname}#${secondCounterUser.digits}`
      );
    } catch (e) {
      expect(e).toBeInstanceOf(ConflictError);
    }
  });

  test("delete invite to counter", async () => {
    const affected = await counterInviteService.deleteInvite(invite.id);

    expect(affected).toBe(1);
  });

  test("creates invite to counter", async () => {
    try {
      invite = await counterInviteService.createInvite(
        counter.id,
        `${secondCounterUser.nickname}#${secondCounterUser.digits}`
      );

      expect(invite).toBeInstanceOf(CounterInvite);
      expect(invite).toMatchObject({
        counter: {
          id: counter.id
        },
        user: {
          id: secondCounterUser.id
        }
      });
    } catch (e) {
      console.dir(e.result, { depth: null });
    }
  });

  test("checks if user is invite reciever", async () => {
    const answer = await counterInviteService.isInviteReciever(
      invite.id,
      secondCounterUser.id
    );
    expect(answer).toBe(true);

    const secondAnswer = await counterInviteService.isInviteReciever(
      invite.id,
      counterUser.id
    );
    expect(secondAnswer).toBe(false);
  });

  test("accepts invite", async () => {
    const participant = await counterInviteService.acceptInvite(invite.id);

    expect(participant).toBeInstanceOf(CounterParticipant);
    expect(participant).toMatchObject({
      counter: {
        id: counter.id
      },
      user: {
        id: secondCounterUser.id
      }
    });

    expect(
      await counterService.isUserCounterParticipant(
        secondCounterUser.id,
        counter.id
      )
    ).toBe(true);

    expect(await counterInviteDao.isExist(invite.id)).toBe(false);
    expect(
      await counterInviteDao.isExistByCounterIdUserId(
        counter.id,
        secondCounterUser.id
      )
    ).toBe(false);
  });

  test("fails to create invite to participant", async () => {
    try {
      await counterInviteService.createInvite(
        counter.id,
        `${secondCounterUser.nickname}#${secondCounterUser.digits}`
      );
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
