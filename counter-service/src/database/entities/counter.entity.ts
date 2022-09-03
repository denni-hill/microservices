import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { CounterInvite } from "./counter-invite.entity";
import { CounterParticipant } from "./counter-participant.entity";
import { CounterScore } from "./counter-score.entity";
import { User } from "./user.entity";

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

  @OneToMany(() => CounterParticipant, (participant) => participant.counter)
  participants: CounterParticipant[];

  @OneToMany(() => CounterScore, (score) => score.counter)
  @JoinColumn()
  scores: CounterScore[];

  @OneToMany(() => CounterInvite, (invite) => invite.counter)
  @JoinColumn()
  invites: CounterInvite[];
}
