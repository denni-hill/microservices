import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CategoryDAO } from "../dao/category.dao";
import { PostDAO } from "../dao/post.dao";
import { CategoryEntity, PostEntity } from "../typeorm/entities";
import { TransformedPostDTO } from "./dto";

@Injectable()
export class PostService {
  constructor(private postDAO: PostDAO, private categoryDAO: CategoryDAO) {}

  async create(dto: TransformedPostDTO): Promise<PostEntity> {
    let newPost = await this.postDAO.create(dto);
    if (dto.categories !== undefined) {
      newPost = await this.attachCategoriesToPost(newPost, dto.categories);
    }

    return newPost;
  }

  async update(id: number, dto: TransformedPostDTO): Promise<PostEntity> {
    let updatedPost = await this.postDAO.update(id, dto);

    if (dto.categories !== undefined) {
      const oldPostCategories = await this.categoryDAO.getPostCategories(id);
      updatedPost = await this.attachCategoriesToPost(
        updatedPost,
        dto.categories
      );
      this.categoryDAO.deleteMany(oldPostCategories.map((cat) => cat.id));
    }

    return updatedPost;
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

  private async attachCategoriesToPost(
    post: PostEntity,
    categories: CategoryEntity[]
  ): Promise<PostEntity> {
    if (post === undefined) throw new InternalServerErrorException();
    if (categories === undefined) return post;

    categories.forEach((cat) => (cat.post = post));
    const postCategories = await this.categoryDAO.createMany(categories);
    postCategories.forEach((cat) => delete cat.post);
    post.categories = postCategories;

    return post;
  }
}
