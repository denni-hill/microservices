import { Injectable } from "@nestjs/common";
import { BlogDAO } from "src/dao/blog.dao";
import { BlogEntity } from "src/typeorm/entities";
import { BlogDTO } from "./dto";

@Injectable()
export class BlogService {
  constructor(private blogDAO: BlogDAO) {}

  create(dto: BlogDTO): Promise<BlogEntity> {
    return this.blogDAO.create(dto);
  }

  update(id: number, dto: BlogDTO): Promise<BlogEntity> {
    return this.blogDAO.update(id, dto);
  }

  getAll(): Promise<BlogEntity[]> {
    return this.blogDAO.getAll();
  }

  getById(id: number): Promise<BlogEntity> {
    return this.blogDAO.getById(id, { notFound: true });
  }

  softDelete(id: number): Promise<BlogEntity> {
    return this.blogDAO.softDelete(id);
  }

  getAllDeleted(): Promise<BlogEntity[]> {
    return this.blogDAO.getAllDeleted();
  }

  getDeletedById(id: number): Promise<BlogEntity> {
    return this.blogDAO.getDeletedById(id, { notFound: true });
  }

  recover(id: number): Promise<BlogEntity> {
    return this.blogDAO.recover(id);
  }

  delete(id: number): Promise<void> {
    return this.blogDAO.delete(id, { notFound: true });
  }
}
