import { RegisterAuthUserDTO } from "../dto/register-auth-user.dto";
import pactum from "pactum";
import jwt from "jsonwebtoken";
import { AuthPayloadDTO } from "../../src/auth/dto";
import crypto from "crypto";
import { UserEntity } from "../../src/typeorm/entities";
import { UserDTO } from "../../src/user/dto";

export interface TokensPair {
  accessToken: string;
  refreshToken: string;
}

export class TestAuthUser {
  constructor(public data: RegisterAuthUserDTO) {}

  public createdBlogUserData: UserEntity;

  public createdAuthUserData: AuthPayloadDTO;

  tokensPair: TokensPair = undefined;

  protected readonly internalAccessToken = jwt.sign(
    {
      is_admin: true,
      isInternalServiceToken: true
    },
    process.env.ACCESS_TOKEN_SECRET,
    { issuer: process.env.DOMAIN }
  );

  protected get pactumAuth() {
    return pactum
      .spec()
      .withHeaders("authorization", `Bearer ${this.internalAccessToken}`);
  }

  public get httpClient() {
    return pactum
      .spec()
      .withHeaders(
        "authorization",
        this.tokensPair?.accessToken !== undefined
          ? `Bearer ${this.tokensPair.accessToken}`
          : ""
      );
  }

  async create() {
    this.createdAuthUserData = await this.pactumAuth
      .withJson(this.data)
      .post(`${process.env.AUTH_SERVICE_HOST}/users`)
      .expectStatus(201)
      .returns("res.body");
  }

  async login() {
    this.tokensPair = await this.httpClient
      .withJson(this.data)
      .expectStatus(200)
      .post(`${process.env.AUTH_SERVICE_HOST}/login`)
      .returns("res.body");
  }

  async registerInBlogService() {
    if (this.createdBlogUserData === undefined) {
      const blogUserData: UserDTO = {
        firstName: "Test",
        lastName: "Test",
        sex: true
      };

      this.createdBlogUserData = await this.httpClient
        .withJson(blogUserData)
        .post(`${process.env.TEST_APP_BASE_URL}/users/register`)
        .expectStatus(201)
        .returns("res.body");
    }
  }

  async deleteInBlogService() {
    if (this.createdBlogUserData !== undefined)
      await this.pactumAuth
        .delete(
          `${process.env.TEST_APP_BASE_URL}/users/${this.createdBlogUserData.id}`
        )
        .expectStatus(200);

    this.createdBlogUserData = undefined;
  }

  async logout() {
    await this.httpClient
      .withBody(this.tokensPair?.refreshToken)
      .withHeaders("content-type", "text/plain")
      .expectStatus(200)
      .post(`${process.env.AUTH_SERVICE_HOST}/logout`);
  }

  async delete() {
    await this.deleteInBlogService();
    if (this.createdAuthUserData === undefined)
      throw new Error("user is not created");
    await this.pactumAuth
      .expectStatus(200)
      .delete(
        `${process.env.AUTH_SERVICE_HOST}/users/${this.createdAuthUserData.id}`
      );
  }
}

export class TestUsersManager {
  public users: TestAuthUser[] = [];

  async createUser(isAdmin = false): Promise<TestAuthUser> {
    const authUserData: RegisterAuthUserDTO = {
      email: `${crypto.randomBytes(20).toString("hex")}@google.com`,
      first_name: "Tests",
      last_name: "Test",
      is_admin: isAdmin,
      password_hash: crypto
        .createHash("sha256")
        .update("bla-bla-bla")
        .digest("hex")
    };

    const user = new TestAuthUser(authUserData);
    await user.create();
    await user.login();
    this.users.push(user);
    return user;
  }

  async logoutAll() {
    for (const user of this.users) {
      await user.logout();
    }
  }

  async deleteAll() {
    for (const user of this.users) {
      await user.delete();
    }

    this.users = [];
  }
}
