import { Module } from "@nestjs/common";
import { DAOModule } from "src/dao/dao.module";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [DAOModule]
})
export class BlogModule {}
