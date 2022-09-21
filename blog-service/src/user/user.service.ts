import { Injectable } from "@nestjs/common";
import { UserDAO } from "../dao/user.dao";
import { CreateUserDTO, UpdateUserDTO } from "./dto";

@Injectable()
export class UserService {
  constructor(private userDAO: UserDAO) {}

  create(dto: CreateUserDTO) {
    return this.userDAO.create(dto);
  }

  get(id: number) {
    return this.userDAO.getById(id);
  }

  getAll() {
    return this.userDAO.getAll();
  }

  update(id: number, dto: UpdateUserDTO) {
    return this.userDAO.update(id, dto);
  }

  delete(id: number) {
    return this.userDAO.delete(id);
  }
}
