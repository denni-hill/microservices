import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import { Counter } from "./counter.entity";
import { User } from "./user.entity";

@Entity("counter__invites")
@Unique(["counter", "user"])
export class CounterInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Counter, (counter) => counter.invites, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    eager: true
  })
  @JoinColumn()
  counter: Counter;

  @ManyToOne(() => User, (user) => user.invites, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    eager: true
  })
  @JoinColumn()
  user: User;
}
