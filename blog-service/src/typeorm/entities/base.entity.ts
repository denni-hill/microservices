import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

// abstract heirarchy will be used in DAO module to define which actions available for entity
// for example: soft deletion available only for entities derived from BaseEntityWithDeletedAtTimestamp

export abstract class BaseEntityWithId {
  @PrimaryGeneratedColumn()
  id: number;
}

export abstract class BaseEntityWithTimestamps extends BaseEntityWithId {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export abstract class BaseEntityWithDeletedAtTimestamp extends BaseEntityWithTimestamps {
  @DeleteDateColumn()
  deletedAt: Date;
}

export abstract class BaseEntity extends BaseEntityWithDeletedAtTimestamp {}
