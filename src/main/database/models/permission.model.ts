/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.model';
import { MinLength } from 'class-validator';
import { ValidationMessage } from './validator/message';

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

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
