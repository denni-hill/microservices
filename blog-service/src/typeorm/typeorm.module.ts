import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeormService } from "./typeorm.service";

@Module({
  providers: [
    {
      provide: TypeormService,
      useFactory: async (config: ConfigService) => {
        const typeormService = new TypeormService(config);
        await typeormService.initializeDataSources();
        return typeormService;
      },
      inject: [ConfigService]
    }
  ],
  imports: [ConfigModule],
  exports: [TypeormService]
})
export class TypeormModule {}
