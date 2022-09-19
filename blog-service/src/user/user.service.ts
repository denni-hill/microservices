import { Injectable } from "@nestjs/common";
import { UserDAO } from "src/dao/user.dao";
import { CreateUserDTO, UpdateUserDTO } from "./dto";

@Injectable()
export class UserService {
  constructor(private userDAO: UserDAO) {}

  create(dto: CreateUserDTO) {
    return this.userDAO.create(dto);
  }

  get(id?: number) {
    return this.userDAO.get(id);
  }

  update(id: number, dto: UpdateUserDTO) {
    return this.userDAO.update(id, dto);
  }

  delete(id: number, soft = true) {
    if (soft) return this.userDAO.softDelete(id);
    else return this.userDAO.delete(id);
  }

  restore(id: number) {
    return this.userDAO.restore(id);
  }
}
