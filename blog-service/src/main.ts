import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExceptionsFilter } from "./exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(8085);
}
bootstrap();
