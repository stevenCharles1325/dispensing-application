/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  AfterLoad,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength, IsNotEmpty, IsIn, ValidateIf } from 'class-validator';
import { ValidationMessage } from './validator/message/message';
import { User } from './user.model';
import { SqliteDataSource } from 'Main/datasource';

@Entity('audit_trails')
export class AuditTrail {
  related: any;

  @AfterLoad()
  async getRelated() {
    const manager = SqliteDataSource.createEntityManager();
    const id =
      this.resource_id_type === 'uuid'
        ? `'${this.resource_id}'`
        : this.resource_id;
    const rawData = await manager.query(
      `SELECT * FROM '${this.resource_table}' WHERE id = ${id}`
    );

    this.related = rawData;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  system_id: number;

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
  @ValidateIf(
    (audit: AuditTrail) =>
      audit.action.toLowerCase().includes('update') ||
      (audit.action.toLowerCase().includes('create') &&
        audit.status === 'SUCCEEDED') ||
      audit.action.toLowerCase().includes('delete') ||
      audit.action.toLowerCase().includes('archive')
  )
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  resource_id: string;

  @Column()
  @ValidateIf(
    (audit: AuditTrail) =>
      audit.action.toLowerCase().includes('update') ||
      audit.action.toLowerCase().includes('archive')
  )
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

  @OneToOne(() => User, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
