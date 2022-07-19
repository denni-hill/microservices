import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Counter } from "./counter";
import { User } from "./user";

@Entity()
export class CounterInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Counter, (counter) => counter.invites, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  counter: Counter;

  @ManyToOne(() => User, (user) => user.sentInvites, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  from: User;

  @ManyToOne(() => User, (user) => user.pendingInvites, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  to: User;
}
