import { Injectable } from "@nestjs/common";
import { PostDAO } from "../dao/post.dao";
import { PostEntity } from "../typeorm/entities";
import { TransformedPostDTO } from "./dto";

@Injectable()
export class PostService {
  constructor(private postDAO: PostDAO) {}

  async create(dto: TransformedPostDTO): Promise<PostEntity> {
    return await this.postDAO.create(dto);
  }

  async update(id: number, dto: TransformedPostDTO): Promise<PostEntity> {
    return await this.postDAO.update(id, dto);
  }

  async getAll(): Promise<PostEntity[]> {
    return await this.postDAO.getAll();
  }

  async getById(id: number): Promise<PostEntity> {
    return await this.postDAO.getById(id);
  }

  async getBlogPost(blogId: number, postId: number): Promise<PostEntity> {
    return await this.postDAO.getBlogPost(blogId, postId);
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
