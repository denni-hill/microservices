import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  FastifyAdapter,
  NestFastifyApplication
} from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  if (process.env.NODE_ENV === "development") {
    const options = new DocumentBuilder().setTitle("Saentist Blog Api").build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("/swagger", app, document);
  }

  await app.listen(8085);
}
bootstrap();
