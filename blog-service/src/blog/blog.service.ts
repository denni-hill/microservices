import { Injectable } from "@nestjs/common";
import { BlogAuthorDAO } from "src/dao/blog-author.dao";
import { BlogDAO } from "src/dao/blog.dao";
import { BlogEntity } from "src/typeorm/entities";
import { CreateBlogDTO, UpdateBlogDTO } from "./dto";

@Injectable()
export class BlogService {
  constructor(private blogDAO: BlogDAO, private blogAuthorDAO: BlogAuthorDAO) {}

  async create(dto: CreateBlogDTO): Promise<BlogEntity> {
    return this.blogDAO.create(dto);
  }

  async update(id: number, dto: UpdateBlogDTO): Promise<BlogEntity> {
    return await this.blogDAO.update(id, dto);
  }

  async getAll(): Promise<BlogEntity[]> {
    return await this.blogDAO.getAll();
  }

  async getById(id: number): Promise<BlogEntity> {
    return await this.blogDAO.getById(id, { notFound: true });
  }

  async softDelete(id: number) {
    return await this.blogDAO.softDelete(id);
  }

  async getAllDeleted() {
    return await this.blogDAO.getAllDeleted();
  }

  async getDeletedById(id: number) {
    return await this.blogDAO.getDeletedById(id, { notFound: true });
  }

  async recover(id: number) {
    return await this.blogDAO.recover(id);
  }

  async delete(id: number) {
    return await this.blogDAO.delete(id, { notFound: true });
  }
}
