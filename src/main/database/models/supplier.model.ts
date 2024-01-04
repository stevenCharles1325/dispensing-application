/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  Relation,
  JoinColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsMobilePhone, Length, IsEmail, MinLength } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import type { Image } from './image.model';
import type { System } from './system.model';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import Provider from '@IOC:Provider';

@Entity('suppliers')
export class Supplier {
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
  system_id: string | null;

  @Column()
  image_id: string | null;

  @Column({
    nullable: true,
    default: null,
  })
  tax_id: string;

  @Column()
  @Length(3, 20, {
    message: ValidationMessage.maxLength,
  })
  name: string;

  @Column()
  @Length(13, undefined, {
    message: ValidationMessage.length,
  }) // 13 characters including "+" sign.
  @IsMobilePhone(
    'en-PH',
    {
      strictMode: true,
    },
    {
      message: ValidationMessage.mobileNumber,
    }
  )
  phone_number: string;

  @Column({ unique: true })
  @IsEmail(undefined, {
    message: ValidationMessage.email,
  })
  email: string;

  @Column()
  @Length(3, 20, {
    message: ValidationMessage.maxLength,
  })
  contact_name: string;

  @Column()
  @Length(13, undefined, {
    message: ValidationMessage.length,
  }) // 13 characters including "+" sign.
  @IsMobilePhone(
    'en-PH',
    {
      strictMode: true,
    },
    {
      message: ValidationMessage.mobileNumber,
    }
  )
  contact_phone_number: string;

  @Column({ unique: true })
  @IsEmail(undefined, {
    message: ValidationMessage.email,
  })
  contact_email: string;

  @Column()
  @MinLength(10, {
    message: ValidationMessage.minLength,
  })
  address: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;

  @OneToOne('Image', { eager: true })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Relation<Image>;

  @OneToOne('System', { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: Relation<System>;
}
