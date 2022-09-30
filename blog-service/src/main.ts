import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder().setTitle("Saentist Blog Api").build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("/swagger", app, document);

  await app.listen(8085);
}
bootstrap();
