import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Counter } from "./counter.entity";
import { User } from "./user.entity";

@Entity({ name: "counters__scores" })
export class CounterScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Counter, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  counter: Counter;

  @ManyToOne(() => User, (participant) => participant, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  from: User;

  @ManyToOne(() => User, (user) => user, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  to: User;

  @Column()
  note: string;
}
