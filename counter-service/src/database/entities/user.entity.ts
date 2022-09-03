import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { CounterInvite } from "./counter-invite.entity";
import { CounterParticipant } from "./counter-participant.entity";

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

  @Column({ default: false })
  isAdmin: boolean;

  @Column()
  sex: boolean;

  @OneToMany(() => CounterParticipant, (participant) => participant.user)
  counters: CounterParticipant[];

  @OneToMany(() => CounterInvite, (invite) => invite.user)
  @JoinColumn()
  invites: CounterInvite[];
}
