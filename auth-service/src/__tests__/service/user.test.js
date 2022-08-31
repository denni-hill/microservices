const getUserHash = require("../../service/get-user-hash");
const crypto = require("crypto");

const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.REDIS_HOST =
  process.env.RABBITMQ_HOST =
  process.env.ELK_HOST =
    "localhost";

const redisClient = require("../../redis");
const UserService = require("../../service/user.service");
const ValidationError = require("../../errors/validation.error");

const userData = {
  email: "test@test.com",
  password_hash: crypto
    .createHash("sha256")
    .update("123321qwerty")
    .digest("hex"),
  first_name: "Denis",
  last_name: "Saenko"
};

const newUserData = [
  {
    email: "another@test.com",
    password_hash: crypto
      .createHash("sha256")
      .update("321123qwerty")
      .digest("hex")
  },
  {
    email: "third@test.com",
    first_name: "Denis",
    last_name: "Saenko"
  },
  {
    first_name: ""
  },
  {
    last_name: ""
  },
  {
    first_name: "Svetlana",
    last_name: "Nazarova"
  },
  {
    password_hash: crypto
      .createHash("sha256")
      .update("adsfgnsiafnbasdn")
      .digest("hex")
  }
];

let user;
let secondUser;

const relevantObjectContaining = expect.objectContaining({
  id: expect.any(Number),
  email: expect.any(String),
  first_name: expect.any(String),
  last_name: expect.any(String),
  is_admin: expect.any(Boolean),
  hash: expect.any(String),
  created_at: expect.any(Date),
  updated_at: expect.any(Date)
});

const expectUserData = (
  user,
  { id, email, first_name, last_name, is_admin, hash }
) => {
  const data = { id, email, first_name, last_name, is_admin, hash };
  for (key in data) {
    if (data[key] !== undefined) expect(user[key]).toBe(data[key]);
  }
};

beforeAll(async () => {
  await redisClient.connect();
});

describe("Test user service", () => {
  test("creates user in database", async () => {
    user = await UserService.createUser(userData);
    expect(user).toEqual(relevantObjectContaining);
    expectUserData(user, userData);
  });

  test("fails to create user with already registered email in database", async () => {
    try {
      await UserService.createUser(userData);
    } catch (e) {
      expect(e instanceof ValidationError).toBe(true);
    }
  });

  test("creates user with another email in database", async () => {
    secondUser = await UserService.createUser({
      ...userData,
      email: "asdfsad@test.com"
    });
    expect(secondUser).toEqual(relevantObjectContaining);
    expectUserData(secondUser, {
      ...userData,
      email: "asdfsad@test.com"
    });
  });

  test("fails to update user with registered email in database", async () => {
    try {
      secondUser = await UserService.updateUser(secondUser.id, userData);
    } catch (e) {
      expect(e instanceof ValidationError).toBe(true);
    }
  });

  test("updates user with it's own email in database", async () => {
    user = await UserService.updateUser(user.id, userData);
    expect(user).toEqual(relevantObjectContaining);
    expectUserData(user, userData);
  });

  test("updates user in database with new email and password", async () => {
    user = await UserService.updateUser(user.id, newUserData[0]);
    expect(user).toEqual(relevantObjectContaining);
    expectUserData(user, newUserData[0]);
  });

  test("fails to update user in database with new email without password input", async () => {
    try {
      await UserService.updateUser(user.id, newUserData[1]);
    } catch (e) {
      expect(e instanceof ValidationError).toBe(true);
    }
  });

  test("fails to update user in database with incorrect first name", async () => {
    try {
      await UserService.updateUser(user.id, newUserData[2]);
    } catch (e) {
      expect(e instanceof ValidationError).toBe(true);
    }
  });

  test("fails to update user in database with incorrect last name", async () => {
    try {
      await UserService.updateUser(user.id, newUserData[3]);
    } catch (e) {
      expect(e instanceof ValidationError).toBe(true);
    }
  });

  test("updates user in database with particular data", async () => {
    user = await UserService.updateUser(user.id, newUserData[4]);
    expect(user).toEqual(relevantObjectContaining);
    expectUserData(user, newUserData[4]);
  });

  test("updates user password", async () => {
    user = await UserService.updateUser(user.id, newUserData[5]);
    expect(user).toEqual(relevantObjectContaining);
    expectUserData(user, {
      hash: getUserHash(user.email, newUserData[5].password_hash)
    });
  });

  test("deletes user in database", async () => {
    expect(await UserService.deleteUser(user.id)).toBe(1);
  });

  test("deletes second user in database", async () => {
    expect(await UserService.deleteUser(secondUser.id)).toBe(1);
  });

  test("deletes nonexistent user in database", async () => {
    expect(await UserService.deleteUser(3248723)).toBe(0);
  });
});

afterAll(async () => {
  await redisClient.disconnect();
});
