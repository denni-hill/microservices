import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CV } from "./CV";

@Entity({ name: "CVContacts" })
export class CVContact {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CV, (cv) => cv.contacts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  CV: CV;

  @Column()
  title: string;

  @Column()
  link: string;
}
