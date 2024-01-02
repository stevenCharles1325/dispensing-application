/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  AfterLoad,
  AfterInsert,
  Relation,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength, IsNotEmpty, IsIn, ValidateIf } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import NotificationDTO from 'App/data-transfer-objects/notification.dto';
import type { User } from './user.model';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuthService from 'App/interfaces/service/service.auth.interface';

@Entity('notifications')
export class Notification {
  @AfterLoad()
  async getSender() {
    if (!this.sender) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = '${this.sender_id}'`
      );

      this.sender = rawData[0];
    }
  }

  @AfterLoad()
  async getRecipient() {
    if (!this.recipient) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = '${this.recipient_id}'`
      );

      this.recipient = rawData[0];
    }
  }

  @AfterInsert()
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

  @Column({ nullable: true })
  @ValidateIf((notif: NotificationDTO) => !notif.is_system_generated)
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  recipient_id: string;

  @Column({ nullable: true })
  @ValidateIf((notif: NotificationDTO) => !notif.is_system_generated)
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  sender_id: string;

  @Column()
  @MinLength(3, { message: ValidationMessage.minLength })
  title: string;

  @Column()
  is_system_generated: boolean;

  @Column()
  @MinLength(5, { message: ValidationMessage.minLength })
  description: string;

  @Column({ nullable: true })
  link: string;

  @Column()
  @IsIn(['NORMAL', 'SUCCESS', 'ERROR', 'WARNING'], {
    message: ValidationMessage.isIn,
  })
  type: string;

  @Column()
  @IsIn(['SEEN', 'UNSEEN', 'VISITED'], {
    message: ValidationMessage.isIn,
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('User', {
    eager: true,
  })
  @JoinColumn({ name: 'recipient_id', referencedColumnName: 'id' })
  recipient: Relation<User>;

  @OneToOne('User', {
    eager: true,
  })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: Relation<User>;
}
