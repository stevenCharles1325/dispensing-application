/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuthService from 'App/interfaces/service/service.auth.interface';

@Entity('categories')
export class Category {
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

  @Column({ nullable: true })
  system_id: string;

  @Column({ unique: true })
  @MinLength(5, { message: ValidationMessage.minLength })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;
}
