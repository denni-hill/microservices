import { Injectable } from "@nestjs/common";
import { DeepPartial } from "src/dao/base.dao";
import { PostDAO } from "src/dao/post.dao";
import { PostEntity } from "src/typeorm/entities";

@Injectable()
export class PostService {
  constructor(private postDAO: PostDAO) {}

  create(dto: DeepPartial<PostEntity>): Promise<PostEntity> {
    return this.postDAO.create(dto);
  }

  update(id: number, dto: DeepPartial<PostEntity>): Promise<PostEntity> {
    return this.postDAO.update(id, dto);
  }

  getAll(): Promise<PostEntity[]> {
    return this.postDAO.getAll();
  }

  getById(id: number): Promise<PostEntity> {
    return this.postDAO.getById(id);
  }

  softDelete(id: number): Promise<PostEntity> {
    return this.postDAO.softDelete(id);
  }

  getDeletedById(id: number): Promise<PostEntity> {
    return this.postDAO.getDeletedById(id);
  }

  recover(id: number): Promise<PostEntity> {
    return this.postDAO.recover(id);
  }

  delete(id: number): Promise<void> {
    return this.postDAO.delete(id, { notFound: true });
  }
}
