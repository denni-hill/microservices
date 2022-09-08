import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import { CounterInvite } from "./counter-invite.entity";
import { CounterParticipant } from "./counter-participant.entity";

@Entity({ name: "users" })
@Unique(["nickname", "digits"])
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
  @JoinColumn()
  counters: CounterParticipant[];

  @OneToMany(() => CounterInvite, (invite) => invite.user)
  @JoinColumn()
  invites: CounterInvite[];

  @Column({ default: false })
  isDeleted: boolean;
}
