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
import { MinLength, IsNotEmpty, IsNotIn } from 'class-validator';
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

  @Column()
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
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  resource_id: string;

  @Column()
  @IsNotIn(['uuid', 'integer'], {
    message: ValidationMessage.notEmpty,
  })
  resource_id_type: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  resource_field: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  old_value: string;

  @Column()
  @IsNotIn(['string', 'number', 'boolean', 'object'], {
    message: ValidationMessage.isIn,
  })
  old_value_type: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  new_value: string;

  @Column()
  @IsNotIn(['string', 'number', 'boolean', 'object'], {
    message: ValidationMessage.isIn,
  })
  new_value_type: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  action: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => User, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
