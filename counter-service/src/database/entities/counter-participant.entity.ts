import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Counter } from "./counter.entity";
import { User } from "./user.entity";

@Entity({ name: "counter__participants" })
@Unique(["counter", "user"])
export class CounterParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Counter, (counter) => counter.participants)
  counter: Counter;

  @ManyToOne(() => User, (user) => user.counters)
  user: User;
}
