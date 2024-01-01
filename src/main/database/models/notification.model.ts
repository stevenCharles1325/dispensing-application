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
import NotificationDTO from 'App/data-transfer-objects/notification.dto';
import type { User } from './user.model';

@Entity('notifications')
export class Notification {
  @AfterLoad()
  async getSender() {
    if (!this.sender) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = ${this.sender_id}`
      );

      this.sender = rawData[0];
    }
  }

  @AfterLoad()
  async getRecipient() {
    if (!this.recipient) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = ${this.recipient_id}`
      );

      this.recipient = rawData[0];
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
  recipient_id: number;

  @Column({ nullable: true })
  @ValidateIf((notif: NotificationDTO) => !notif.is_system_generated)
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  sender_id: number;

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
