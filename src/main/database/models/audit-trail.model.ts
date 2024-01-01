/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  AfterLoad,
  Relation,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength, IsNotEmpty, IsIn, ValidateIf } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import type { User } from './user.model';

@Entity('audit_trails')
export class AuditTrail {
  related: any;

  @AfterLoad()
  async getRelated() {
    const manager = global.datasource.createEntityManager();
    const id =
      this.resource_id_type === 'uuid'
        ? `'${this.resource_id}'`
        : this.resource_id;
    const rawData: any[] = await manager.query(
      `SELECT * FROM '${this.resource_table}' WHERE id = ${id}`
    );

    this.related = rawData[0];
  }

  @AfterLoad()
  async getUser() {
    if (!this.user) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = ${this.user_id}`
      );

      this.user = rawData[0];
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  system_id: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  user_id: number;

  @Column()
  @MinLength(5, { message: ValidationMessage.minLength })
  description: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  resource_table: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  resource_id: string;

  @Column()
  @IsIn(['uuid', 'integer'], {
    message: ValidationMessage.notEmpty,
  })
  resource_id_type: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  action: string;

  @Column()
  @IsIn(['SUCCEEDED', 'FAILED'], {
    message: ValidationMessage.isIn,
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('User', {
    eager: true,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<User>;
}
