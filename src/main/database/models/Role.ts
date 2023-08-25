/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './Permission';
import { MinLength } from 'class-validator';

const messages = {
  minLength: 'Length must be at least $constraint1',
};

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  @MinLength(5, { message: messages.minLength })
  name: string;

  @Column({ unique: true })
  @MinLength(5, { message: messages.minLength })
  kebab: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
    },
  })
  permissions: Permission[];
}
