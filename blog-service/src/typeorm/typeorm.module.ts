import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeormService } from "./typeorm.service";

@Module({
  providers: [TypeormService],
  imports: [ConfigModule],
  exports: [TypeormService]
})
export class TypeormModule {}
