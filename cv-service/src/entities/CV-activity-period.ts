import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "CVActivityPeriods" })
export class CVActivityPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: Date;

  @Column()
  to: Date;

  @Column()
  title: string;

  @Column()
  content: string;
}
