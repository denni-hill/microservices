import { Module } from "@nestjs/common";
import { DAOModule } from "../dao/dao.module";
import { BlogCategoryController } from "./blog-category.controller";
import { CategoryService } from "./category.service";

@Module({
  controllers: [BlogCategoryController],
  providers: [CategoryService],
  imports: [DAOModule]
})
export class CategoryModule {}
