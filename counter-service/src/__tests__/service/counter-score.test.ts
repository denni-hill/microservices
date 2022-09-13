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
import messenger from "../../rabbitmq/messenger";
import { CounterScore } from "../../database/entities/counter-score.entity";
import counterScoreService from "../../service/counter-score.service";

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
let firstScore: CounterScore;
let secondScore: CounterScore;

beforeAll(async () => {
  await defaultDataSource.initialize();
  await messenger.connect();
});

describe("tests counter score service", () => {
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

  test("adds second user to counter participants", async () => {
    const participant = await counterService.addParticipant(
      counter.id,
      secondCounterUser.id
    );

    expect(participant).toBeInstanceOf(CounterParticipant);
  });

  test("creates score from owner to another participant", async () => {
    firstScore = await counterScoreService.createScore({
      counter: counter.id,
      from: counterUser.id,
      to: secondCounterUser.id,
      note: "bla-bla-bla-bla-bla"
    });

    expect(firstScore).toBeInstanceOf(CounterScore);
    expect(firstScore).toMatchObject({
      counter: {
        id: counter.id
      },
      from: {
        id: counterUser.id
      },
      to: {
        id: secondCounterUser.id
      },
      note: "bla-bla-bla-bla-bla"
    });
  });

  test("get score", async () => {
    firstScore = await counterScoreService.getScore(firstScore.id);

    expect(firstScore).toBeInstanceOf(CounterScore);
  });

  test("updates core note", async () => {
    firstScore = await counterScoreService.updateScoreNote(
      firstScore.id,
      "not bla-bla-bla-bla"
    );

    expect(firstScore).toBeInstanceOf(CounterScore);
    expect(firstScore).toMatchObject({
      note: "not bla-bla-bla-bla"
    });
  });

  test("checks if user has scores", async () => {
    expect(await counterScoreService.doesUserHaveScores(counterUser.id)).toBe(
      true
    );

    expect(
      await counterScoreService.doesUserHaveScores(secondCounterUser.id)
    ).toBe(false);
  });

  test("checks if user is score author", async () => {
    expect(
      await counterScoreService.isScoreAuthor(firstScore.id, counterUser.id)
    ).toBe(true);

    expect(
      await counterScoreService.isScoreAuthor(
        firstScore.id,
        secondCounterUser.id
      )
    ).toBe(false);
  });

  test("creates second score from participant to owner", async () => {
    secondScore = await counterScoreService.createScore({
      counter: counter.id,
      from: secondCounterUser.id,
      to: counterUser.id,
      note: "test"
    });

    expect(secondScore).toBeInstanceOf(CounterScore);
    expect(secondScore).toMatchObject({
      counter: {
        id: counter.id
      },
      from: {
        id: secondCounterUser.id
      },
      to: {
        id: counterUser.id
      },
      note: "test"
    });
  });

  test("checks if user is score author", async () => {
    expect(
      await counterScoreService.isScoreAuthor(
        secondScore.id,
        secondCounterUser.id
      )
    ).toBe(true);

    expect(
      await counterScoreService.isScoreAuthor(secondScore.id, counterUser.id)
    ).toBe(false);
  });

  test("get counter scores", async () => {
    const scores = await counterScoreService.getCounterScores(counter.id);

    expect(scores.length).toBe(2);
  });

  test("deletes score", async () => {
    expect(await counterScoreService.deleteScore(firstScore.id)).toBe(1);
    expect(await counterScoreService.deleteScore(secondScore.id)).toBe(1);
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
