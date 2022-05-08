import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { CVActivityPeriod } from "./CV-activity-period";
import { CVContact } from "./CV-contact";

@Entity({ name: "CVs" })
export class CV {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  owner: string;

  @OneToMany(() => CVContact, (contact) => contact.CV)
  @JoinColumn()
  contacts: CVContact[];

  @ManyToMany(() => CVActivityPeriod, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinTable({
    name: "CVs__education",
    joinColumn: {
      name: "CVId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "ActivityPeriodId",
      referencedColumnName: "id"
    }
  })
  education: CVActivityPeriod[];

  @ManyToMany(() => CVActivityPeriod, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinTable({
    name: "CVs__workExperience",
    joinColumn: {
      name: "CVId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "ActivityPeriodId",
      referencedColumnName: "id"
    }
  })
  workExperience: CVActivityPeriod[];
}
