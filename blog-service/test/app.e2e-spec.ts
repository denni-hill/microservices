import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { UserData } from "../src/auth/dto";
import { TestAuthUser, TestUsersManager } from "./misc";
import {
  BlogAuthorEntity,
  BlogEntity,
  PostEntity
} from "../src/typeorm/entities";
import { BlogDTO } from "../src/blog/dto";
import { PostDTO } from "../src/post/dto";
import {
  FastifyAdapter,
  NestFastifyApplication
} from "@nestjs/platform-fastify";

process.env.TEST_APP_BASE_URL = "http://localhost:8085";

describe("App e2e", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = appModule.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    app.listen(8085);
  });

  describe("testing user module", () => {
    let authUser: TestAuthUser;

    const usersManager = new TestUsersManager();

    beforeAll(async () => {
      authUser = await usersManager.createUser(true);
    });

    test("register user", async () => {
      await authUser.registerInBlogService();
    });

    test("delete user", async () => {
      await authUser.deleteInBlogService();
    });

    test("create user", async () => {
      await authUser.registerInBlogService();
    });

    test("get users", async () => {
      const users = await authUser.httpClient
        .get(`${process.env.TEST_APP_BASE_URL}/users`)
        .expectStatus(200)
        .returns("res.body");
      expect(Array.isArray(users)).toBe(true);
    });

    test("get specific user", async () => {
      const user = await authUser.httpClient
        .get(
          `${process.env.TEST_APP_BASE_URL}/users/${authUser.createdBlogUserData.id}`
        )
        .expectStatus(200)
        .returns("res.body");

      expect(user).toBeDefined();
    });

    test("get me", async () => {
      const user = await authUser.httpClient
        .get(`${process.env.TEST_APP_BASE_URL}/users/me`)
        .expectStatus(200)
        .returns("res.body");

      expect(user).toBeDefined();
    });

    test("update me", async () => {
      const newName = "TEST TEST TEST";
      const updatedUser = (await authUser.httpClient
        .withBody({ firstName: newName })
        .patch(`${process.env.TEST_APP_BASE_URL}/users/me`)
        .expectStatus(200)
        .returns("res.body")) as UserData;
      expect(updatedUser.firstName).toBe(newName);
    });

    test("update user", async () => {
      const newName = "TEST_TEST_TEST";
      const updatedUser = (await authUser.httpClient
        .withBody({ firstName: newName })
        .patch(
          `${process.env.TEST_APP_BASE_URL}/users/${authUser.createdBlogUserData.id}`
        )
        .expectStatus(200)
        .returns("res.body")) as UserData;
      expect(updatedUser.firstName).toBe(newName);
    });

    test("delete user", async () => {
      await authUser.deleteInBlogService();
    });

    afterAll(async () => {
      usersManager.deleteAll();
    });
  });

  describe("testing blog module", () => {
    let adminUser: TestAuthUser;
    let blog: BlogEntity;
    const usersManager = new TestUsersManager();

    beforeAll(async () => {
      adminUser = await usersManager.createUser(true);
      await adminUser.registerInBlogService();
    });

    test("create blog", async () => {
      const testBlogData: BlogDTO = {
        name: "test blog",
        description: "test blog description"
      };

      blog = await adminUser.httpClient
        .withBody(testBlogData)
        .post(`${process.env.TEST_APP_BASE_URL}/blogs`)
        .expectJsonMatch(testBlogData)
        .expectStatus(201)
        .returns("res.body");
    });

    test("update blog", async () => {
      const testBlogNewData: BlogDTO = {
        name: "updated test blog",
        description: "updated test blog description"
      };

      blog = await adminUser.httpClient
        .withBody(testBlogNewData)
        .patch(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}`)
        .expectJsonMatch(testBlogNewData)
        .expectStatus(200)
        .returns("res.body");
    });

    test("soft delete blog", async () => {
      blog = await adminUser.httpClient
        .delete(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}`)
        .expectStatus(200)
        .returns("res.body");

      expect(blog.deletedAt !== null).toBe(true);
    });

    test("restore delete blog", async () => {
      blog = await adminUser.httpClient
        .patch(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/recover`)
        .expectStatus(200)
        .returns("res.body");

      expect(blog.deletedAt === null).toBe(true);
    });

    test("purge blog", async () => {
      await adminUser.httpClient.delete(
        `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/purge`
      );
    });

    afterAll(async () => {
      await usersManager.deleteAll();
    });
  });

  describe("testing blog authors module", () => {
    let adminUser: TestAuthUser;
    let regularUser: TestAuthUser;
    let blog: BlogEntity;
    const usersManager = new TestUsersManager();

    beforeAll(async () => {
      adminUser = await usersManager.createUser(true);
      regularUser = await usersManager.createUser();

      await adminUser.registerInBlogService();
      await regularUser.registerInBlogService();
    });

    test("create blog", async () => {
      const testBlogData: BlogDTO = {
        name: "test blog",
        description: "test blog description"
      };

      blog = await adminUser.httpClient
        .withBody(testBlogData)
        .post(`${process.env.TEST_APP_BASE_URL}/blogs`)
        .expectJsonMatch(testBlogData)
        .expectStatus(201)
        .returns("res.body");
    });

    test("assign blog author", async () => {
      await adminUser.httpClient
        .withJson({
          user: regularUser.createdBlogUserData.id
        })
        .post(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/authors`)
        .expectStatus(201)
        .expectJsonMatch({
          blog: {
            id: blog.id
          },
          user: {
            id: regularUser.createdBlogUserData.id
          }
        })
        .returns("res.body");
    });

    test("get blog authors", async () => {
      const authors: BlogAuthorEntity[] = await adminUser.httpClient
        .get(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/authors`)
        .expectStatus(200)
        .returns("res.body");

      expect(Array.isArray(authors)).toBe(true);

      expect(
        authors.some(
          (author) => author.user.id === regularUser.createdBlogUserData.id
        )
      ).toBe(true);
    });

    test("delete blog author", async () => {
      adminUser.httpClient
        .delete(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/authors/${regularUser.createdBlogUserData.id}`
        )
        .expectStatus(200);
    });

    test("purge blog", async () => {
      await adminUser.httpClient.delete(
        `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/purge`
      );
    });

    afterAll(async () => {
      await usersManager.deleteAll();
    });
  });

  describe("testing posts module", () => {
    let adminUser: TestAuthUser;
    let regularUser: TestAuthUser;
    let blog: BlogEntity;
    let post: PostEntity;
    const usersManager = new TestUsersManager();

    beforeAll(async () => {
      adminUser = await usersManager.createUser(true);
      regularUser = await usersManager.createUser();

      await adminUser.registerInBlogService();
      await regularUser.registerInBlogService();
    });

    test("create blog", async () => {
      const testBlogData: BlogDTO = {
        name: "test blog",
        description: "test blog description"
      };

      blog = await adminUser.httpClient
        .withBody(testBlogData)
        .post(`${process.env.TEST_APP_BASE_URL}/blogs`)
        .expectJsonMatch(testBlogData)
        .expectStatus(201)
        .returns("res.body");
    });

    test("assign blog author", async () => {
      await adminUser.httpClient
        .withJson({
          user: regularUser.createdBlogUserData.id
        })
        .post(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/authors`)
        .expectStatus(201)
        .expectJsonMatch({
          blog: {
            id: blog.id
          },
          user: {
            id: regularUser.createdBlogUserData.id
          }
        })
        .returns("res.body");
    });

    test("create blog post", async () => {
      const postCategories = ["1", "2", "3"];
      const postData: PostDTO = {
        title: "Test blog post",
        content: "Test blog content"
      };
      post = await regularUser.httpClient
        .withJson({ ...postData, categories: postCategories })
        .expectStatus(201)
        .expectJsonMatch(postData)
        .post(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts`)
        .returns("res.body");

      expect(post.categories.map((cat) => cat.name)).toMatchObject(
        postCategories
      );
    });

    test("get blog post", async () => {
      await regularUser.httpClient
        .get(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}`
        )
        .expectStatus(200)
        .expectJsonMatch({
          id: post.id
        });
    });

    test("get blog posts", async () => {
      await regularUser.httpClient
        .get(`${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts`)
        .expectStatus(200)
        .expectJsonMatch([
          {
            id: post.id
          }
        ])
        .returns("res.body");
    });

    test("update blog post", async () => {
      const postData: PostDTO = {
        title: "Updated test blog post",
        content: "Updated test blog content",
        categories: []
      };
      post = await regularUser.httpClient
        .withJson(postData)
        .expectStatus(200)
        .expectJsonMatch(postData)
        .patch(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}`
        )
        .returns("res.body");

      const postWithoutCategories = await regularUser.httpClient
        .expectStatus(200)
        .get(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}`
        )
        .returns("res.body");

      expect(postWithoutCategories.categories).toMatchObject([]);
    });

    test("delete blog post", async () => {
      await regularUser.httpClient
        .expectStatus(200)
        .delete(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}`
        );

      await regularUser.httpClient
        .expectStatus(404)
        .delete(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}`
        );
    });

    test("recover blog post", async () => {
      await regularUser.httpClient
        .expectStatus(200)
        .patch(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}/recover`
        );
    });

    test("purge blog post", async () => {
      await regularUser.httpClient
        .expectStatus(403)
        .delete(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}/purge`
        );

      await adminUser.httpClient
        .expectStatus(200)
        .delete(
          `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/posts/${post.id}/purge`
        );
    });

    test("purge blog", async () => {
      await adminUser.httpClient.delete(
        `${process.env.TEST_APP_BASE_URL}/blogs/${blog.id}/purge`
      );
    });

    afterAll(async () => {
      await usersManager.deleteAll();
    });
  });

  afterAll(() => {
    app.close();
  });
});
