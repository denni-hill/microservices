import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { CounterInvite } from "./counter-invite";
import { CounterScore } from "./counter-score";
import { User } from "./user";

@Entity({ name: "counters" })
export class Counter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @ManyToMany(() => User, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  @JoinTable({
    name: "counters__participants",
    joinColumn: {
      name: "counter_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id"
    }
  })
  participants: User[];

  @OneToMany(() => CounterScore, (score) => score.counter)
  @JoinColumn()
  scores: CounterScore[];

  @OneToMany(() => CounterInvite, (invite) => invite.counter)
  @JoinColumn()
  invites: CounterInvite[];
}
