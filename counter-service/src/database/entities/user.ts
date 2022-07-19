import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Counter } from "./counter";
import { CounterInvite } from "./counter-invite";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  authUserId: number;

  @Column()
  nickname: string;

  @Column()
  digits: number;

  @Column()
  isAdmin: boolean;

  @Column()
  sex: boolean;

  @ManyToMany(() => Counter, (counter) => counter.participants, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  counters: Counter[];

  @OneToMany(() => CounterInvite, (invite) => invite.from)
  @JoinColumn()
  sentInvites: CounterInvite[];

  @OneToMany(() => CounterInvite, (invite) => invite.to)
  @JoinColumn()
  pendingInvites: CounterInvite[];
}
