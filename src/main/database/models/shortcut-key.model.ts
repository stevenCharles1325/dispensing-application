/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.model';
import { MinLength } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuthService from 'App/interfaces/service/service.auth.interface';

@Entity('shortcut_keys')
export class ShortcutKey {
  @BeforeInsert()
  async getSystemData() {
    const authService = Provider.ioc<IAuthService>('AuthProvider');
    const token = authService.getAuthToken?.()?.token;

    const authResponse = authService.verifyToken(token);

    if (authResponse.status === 'SUCCESS' && !this.system_id) {
      const user = authResponse.data as UserDTO;
      this.system_id = user.system_id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  system_id: string;

  @Column({
    nullable: false,
  })
  user_id: string;

  @Column()
  @MinLength(1, { message: ValidationMessage.minLength })
  key: string;

  @Column()
  @MinLength(1, { message: ValidationMessage.minLength })
  key_combination: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('User', (user: User) => user.shortcut_keys)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<User>;
}
