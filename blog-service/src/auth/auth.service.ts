import { Injectable } from "@nestjs/common";
import { UserDAO } from "src/dao/user.dao";
import { CreateUserDTO } from "src/user/dto";

@Injectable()
export class AuthService {
  constructor(private userDAO: UserDAO) {}
  async register(dto: CreateUserDTO) {
    return await this.userDAO.create(dto);
  }
}
