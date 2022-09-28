import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/typeorm/entities";
import { UserDAO } from "../dao/user.dao";
import { UserDTO } from "./dto";

@Injectable()
export class UserService {
  constructor(private userDAO: UserDAO) {}

  async create(dto: UserDTO): Promise<UserEntity> {
    return await this.userDAO.create(dto);
  }

  async get(id: number): Promise<UserEntity> {
    return await this.userDAO.getById(id);
  }

  async getAll(): Promise<UserEntity[]> {
    return await this.userDAO.getAll();
  }

  async update(id: number, dto: UserDTO): Promise<UserEntity> {
    return await this.userDAO.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    return await this.userDAO.delete(id, { notFound: true });
  }
}
