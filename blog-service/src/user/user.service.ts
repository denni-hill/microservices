import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/typeorm/entities";
import { UserDAO } from "../dao/user.dao";
import { CreateUserDTO, UpdateUserDTO } from "./dto";

@Injectable()
export class UserService {
  constructor(private userDAO: UserDAO) {}

  create(dto: CreateUserDTO): Promise<UserEntity> {
    return this.userDAO.create(dto);
  }

  get(id: number): Promise<UserEntity> {
    return this.userDAO.getById(id);
  }

  getAll(): Promise<UserEntity[]> {
    return this.userDAO.getAll();
  }

  update(id: number, dto: UpdateUserDTO): Promise<UserEntity> {
    return this.userDAO.update(id, dto);
  }

  delete(id: number): Promise<void> {
    return this.userDAO.delete(id);
  }
}
