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
import { Counter } from "../../database/entities/counter.entity";
import userService from "../../service/user.service";
import counterService from "../../service/counter.service";
import { CounterInvite } from "../../database/entities/counter-invite.entity";
import { CounterScore } from "../../database/entities/counter-score.entity";

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
let secondClientAxios: AxiosInstance;

const testUserData = {
  first_name: "Test",
  last_name: "Test",
  email: "test@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};

const anotherTestUserData = {
  first_name: "Test",
  last_name: "Test",
  email: "another@test.com",
  password_hash: crypto.createHash("sha256").update("bla-bla-bla").digest("hex")
};

let authUser: AuthUserData;
let secondAuthUser: AuthUserData;
let userAccessToken: string;
let counterUser: User;
let secondCounterUser: User;
let counter: Counter;
let invite: CounterInvite;
let firstScore: CounterScore;
let secondScore: CounterScore;

beforeAll(async () => {
  await app.start();
});

describe("tests counters scores routes", () => {
  test("creating test user in auth service", async () => {
    authUser = (await authServiceAxios.post("/users/create", testUserData))
      .data;

    secondAuthUser = (
      await authServiceAxios.post("/users/create", anotherTestUserData)
    ).data;
  });

  test("creating user for counter", async () => {
    counterUser = await userService.createUser({
      authUserId: authUser.id,
      nickname: "test",
      sex: true
    });

    secondCounterUser = await userService.createUser({
      authUserId: secondAuthUser.id,
      nickname: "another",
      sex: false
    });
  });

  test("creating counter", async () => {
    counter = await counterService.createCounter({
      name: "test counter",
      description: "test counter",
      owner: counterUser.id
    });
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

    const { accessToken: secondAccessToken } = (
      await authServiceAxios.post("/login", {
        email: anotherTestUserData.email,
        password_hash: anotherTestUserData.password_hash
      })
    ).data;

    secondClientAxios = Axios.create({
      baseURL: `http://localhost:${process.env.PORT}`,
      headers: {
        authorization: "Bearer " + secondAccessToken,
        accept: "*/*"
      }
    });
  });

  test("create valid invite", async () => {
    try {
      const response = await clientAxios.post(
        `/counters/invites/${counter.id}`,
        `${secondCounterUser.nickname}#${secondCounterUser.digits}`,
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );

      expect(response.status).toBe(201);
      invite = response.data;

      expect(invite).toMatchObject({
        counter: {
          id: counter.id
        },
        user: {
          id: secondCounterUser.id
        }
      });
    } catch (e) {
      console.dir(e.response.data, { depth: null });
      throw e;
    }
  });

  test("accept invite", async () => {
    try {
      const response = await secondClientAxios.get(
        `/counters/invites/accept/${invite.id}`
      );

      expect(response.status).toBe(201);

      expect(
        await counterService.isUserCounterParticipant(
          secondCounterUser.id,
          counter.id
        )
      ).toBe(true);
    } catch (e) {
      console.dir(e.response.data, { depth: null });
      throw e;
    }
  });

  test("create score from owner to participant", async () => {
    try {
      const response = await clientAxios.post(
        `/counters/scores/${counter.id}`,
        {
          to: secondCounterUser.id,
          note: "Here is your score!"
        }
      );

      expect(response.status).toBe(201);

      firstScore = response.data;
      expect(firstScore).toMatchObject({
        from: {
          id: counterUser.id
        },
        to: {
          id: secondCounterUser.id
        },
        note: "Here is your score!",
        counter: {
          id: counter.id
        }
      });
    } catch (e) {
      console.dir(e.response.data);
      throw e;
    }
  });

  test("create score from participant to owner", async () => {
    const response = await secondClientAxios.post(
      `/counters/scores/${counter.id}`,
      {
        to: counterUser.id,
        note: "Here is another score!"
      }
    );

    expect(response.status).toBe(201);

    secondScore = response.data;
    expect(secondScore).toMatchObject({
      from: {
        id: secondCounterUser.id
      },
      to: {
        id: counterUser.id
      },
      note: "Here is another score!",
      counter: {
        id: counter.id
      }
    });
  });

  test("update score note", async () => {
    try {
      const response = await clientAxios.put(
        `/counters/scores/${counter.id}/${firstScore.id}`,
        "Here is your updated score",
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );

      expect(response.status).toBe(200);

      expect(response.data).toMatchObject({
        note: "Here is your updated score"
      });
    } catch (e) {
      console.dir(e.response.data);
      throw e;
    }
  });

  test("update someone else's score note", async () => {
    try {
      await secondClientAxios.put(
        `/counters/scores/${counter.id}/${firstScore.id}`,
        "Here is your updated score",
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );
    } catch (e) {
      expect(e.response.status).toBe(403);
    }
  });

  test("delete score", async () => {
    const response = await clientAxios.delete(
      `/counters/scores/${counter.id}/${firstScore.id}`
    );

    expect(response.status).toBe(200);
  });

  test("delete someone else's score", async () => {
    try {
      await clientAxios.delete(
        `/counters/scores/${counter.id}/${secondScore.id}`
      );
    } catch (e) {
      expect(e.response.status).toBe(403);
    }
  });

  test("delete score", async () => {
    const response = await secondClientAxios.delete(
      `/counters/scores/${counter.id}/${secondScore.id}`
    );

    expect(response.status).toBe(200);
  });
});

afterAll(async () => {
  await counterService.deleteCounter(counter.id);
  await authServiceAxios.delete(`/users/${authUser.id}`);
  await authServiceAxios.delete(`/users/${secondAuthUser.id}`);
  await userService.deleteUser(counterUser.id, false);
  await userService.deleteUser(secondCounterUser.id, false);
  await app.stop();
});
