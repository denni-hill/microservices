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

beforeAll(async () => {
  await app.start();
});

describe("tests counters invites routes", () => {
  test("creating test user in auth service", async () => {
    authUser = (await authServiceAxios.post("/users", testUserData)).data;

    secondAuthUser = (
      await authServiceAxios.post("/users", anotherTestUserData)
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

  test("create invite duplicate", async () => {
    try {
      await clientAxios.post(
        `/counters/invites/${counter.id}`,
        `${secondCounterUser.nickname}#${secondCounterUser.digits}`,
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );
      throw "Unexpected success";
    } catch (e) {
      expect(e.response.status).toBe(409);
    }
  });

  test("create invalid invite to participant", async () => {
    try {
      await clientAxios.post(
        `/counters/invites/${counter.id}`,
        `${counterUser.nickname}#${counterUser.digits}`,
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );
      throw "Unexpected success";
    } catch (e) {
      expect(e.response.status).toBe(409);
    }
  });

  test("create invite with no rights", async () => {
    try {
      await secondClientAxios.post(
        `/counters/invites/${counter.id}`,
        `${counterUser.nickname}#${counterUser.digits}`,
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );
      throw "Unexpected success";
    } catch (e) {
      expect(e.response.status).toBe(403);
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

    await counterService.removeParticipant(counter.id, secondCounterUser.id);
  });

  test("create invite", async () => {
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
  });

  test("delete invite by counter owner", async () => {
    try {
      const response = await clientAxios.delete(
        `/counters/invites/${counter.id}/${invite.id}`
      );

      expect(response.status).toBe(200);
    } catch (e) {
      console.dir(e.response.body, { depth: null });
      throw e;
    }
  });

  test("create invite", async () => {
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
  });

  test("delete invite by reciever", async () => {
    const response = await secondClientAxios.delete(
      `/counters/invites/${counter.id}/${invite.id}`
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
