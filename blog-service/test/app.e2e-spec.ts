import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { ExceptionsFilter } from "../src/exceptions.filter";
import { AppModule } from "../src/app.module";

describe("App e2e", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = appModule.createNestApplication();
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsFilter(httpAdapter));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        exceptionFactory(errors) {
          return new UnprocessableEntityException(
            errors.map(({ property, constraints }) => ({
              property,
              messages: Object.keys(constraints)
            }))
          );
        }
      })
    );
    await app.init();
    app.listen(8085);
  });

  it.todo("should pass");

  afterAll(() => {
    app.close();
  });
});
