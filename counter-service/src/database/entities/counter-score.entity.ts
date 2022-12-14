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

  @ManyToOne(() => User, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
    eager: true
  })
  @JoinColumn()
  from: User;

  @ManyToOne(() => User, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
    eager: true
  })
  @JoinColumn()
  to: User;

  @Column()
  note: string;
}
