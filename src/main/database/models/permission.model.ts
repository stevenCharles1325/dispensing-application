/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import type { Role } from './role.model';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  system_id: number;

  @Column({ unique: true })
  @MinLength(5, { message: ValidationMessage.minLength })
  name: string;

  @Column({ unique: true })
  @MinLength(5, { message: ValidationMessage.minLength })
  kebab: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany('Role', (role: Role) => role.permissions)
  roles: Relation<Role>[];
}
