/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  AfterLoad,
  BeforeInsert,
  Relation,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength, IsNotEmpty, IsIn } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import type { User } from './user.model';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';

@Entity('audit_trails')
export class AuditTrail {
  related: any;

  @AfterLoad()
  async getRelated() {
    const manager = global.datasource.createEntityManager();
    const id = this.resource_id
    const rawData: any[] = await manager.query(
      `SELECT * FROM '${this.resource_table}' WHERE id = '${id}'`
    );

    this.related = rawData[0];
  }

  @AfterLoad()
  async getUser() {
    if (!this.user) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = '${this.user_id}'`
      );

      this.user = rawData[0];
    }
  }

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

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  user_id: string;

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
  @IsIn(['uuid'], {
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

  @OneToOne('User', {
    eager: true,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<User>;
}
