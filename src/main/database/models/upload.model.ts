/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  Relation,
  AfterLoad,
  JoinColumn,
  BeforeInsert,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.model';
import type { System } from './system.model';
import UploadDataDTO from 'App/data-transfer-objects/upload-data.dto';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuthService from 'App/interfaces/service/service.auth.interface';

@Entity('uploads')
export class Upload {
  uploader_data: UploadDataDTO[];

  @AfterLoad()
  async getUploadData() {
    const UploadDataRepository = global.datasource.getRepository('upload_datas');
    const uploaderData = await UploadDataRepository.findBy({ upload_id: this.id });

    this.uploader_data = uploaderData as UploadDataDTO[];
  }

  @AfterLoad()
  async getUploader() {
    const UserRepository = global.datasource.getRepository('users');
    const uploader = await UserRepository.findOneByOrFail({ id: this.uploader_id });

    this.uploader = uploader as User;
  }

  @BeforeInsert()
  async getSystemAndUploaderData() {
    const authService = Provider.ioc<IAuthService>('AuthProvider');
    const token = authService.getAuthToken?.()?.token;

    const authResponse = authService.verifyToken(token);

    if (authResponse.status === 'SUCCESS' && !this.system_id) {
      const user = authResponse.data as UserDTO;
      this.system_id = user.system_id;
      this.uploader_id = user.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  uploader_id: string;

  @Column({ nullable: false })
  system_id: string;

  @Column({ nullable: false })
  file_name: string;

  @Column({ nullable: false })
  total: number;

  @Column({ nullable: true, default: 0 })
  success_count: number;

  @Column({ nullable: true, default: 0 })
  error_count: number;

  @Column({ nullable: true, default: 'pending' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('User', {
    eager: true,
  })
  @JoinColumn({ name: 'uploader_id', referencedColumnName: 'id' })
  uploader: Relation<User>;

  @OneToOne('System', {
    eager: true,
  })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: Relation<System>;
}
