import { Injectable } from "@nestjs/common";
import { UserDAO } from "src/dao/user.dao";
import { CreateUserDTO, UpdateUserDTO } from "./dto";

@Injectable()
export class UserService {
  constructor(private userDAO: UserDAO) {}

  create(dto: CreateUserDTO) {
    return this.userDAO.create(dto);
  }

  update(id: number, dto: UpdateUserDTO) {
    return this.userDAO.update(id, dto);
  }
}
