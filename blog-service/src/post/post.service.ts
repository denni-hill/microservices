import { Injectable } from "@nestjs/common";
import { DeepPartial } from "src/dao/base.dao";
import { PostDAO } from "src/dao/post.dao";
import { PostEntity } from "src/typeorm/entities";

@Injectable()
export class PostService {
  constructor(private postDAO: PostDAO) {}

  async create(dto: DeepPartial<PostEntity>): Promise<PostEntity> {
    return await this.postDAO.create(dto);
  }

  async update(id: number, dto: DeepPartial<PostEntity>): Promise<PostEntity> {
    return await this.postDAO.update(id, dto);
  }

  async getAll(): Promise<PostEntity[]> {
    return await this.postDAO.getAll();
  }

  async getById(id: number): Promise<PostEntity> {
    return await this.postDAO.getById(id);
  }

  async getBlogPosts(blogId: number): Promise<PostEntity[]> {
    return await this.postDAO.getBlogPosts(blogId);
  }

  async softDelete(id: number): Promise<PostEntity> {
    return await this.postDAO.softDelete(id);
  }

  async getDeletedById(id: number): Promise<PostEntity> {
    return await this.postDAO.getDeletedById(id);
  }

  async recover(id: number): Promise<PostEntity> {
    return await this.postDAO.recover(id);
  }

  async delete(id: number): Promise<void> {
    return await this.postDAO.delete(id, { notFound: true });
  }
}
