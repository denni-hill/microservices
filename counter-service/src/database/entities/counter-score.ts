import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Counter } from "./counter";
import { User } from "./user";

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

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  from: User;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  to: User;

  @Column()
  note: string;
}
