/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  Relation,
  AfterLoad,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.model';
import UploadDataDTO from 'App/data-transfer-objects/upload-data.dto';

@Entity('uploads')
export class Upload {
  uploader_data: UploadDataDTO[];

  @AfterLoad()
  async getUploadData() {
    const UploadDataRepository = global.datasource.getRepository('upload_datas');
    const uploaderData = await UploadDataRepository.findBy({ uploader_id: this.id });

    this.uploader_data = uploaderData as UploadDataDTO[];
  }

  @AfterLoad()
  async getUploader() {
    const UserRepository = global.datasource.getRepository('users');
    const uploader = await UserRepository.findOneByOrFail({ id: this.uploader_id });

    this.uploader = uploader as User;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  uploader_id: string;

  @Column({ nullable: false })
  file_name: string;

  @Column({ nullable: false })
  total: number;

  @Column({ nullable: false })
  success_count: number;

  @Column({ nullable: true, default: 0 })
  error_count: number;

  @Column({ nullable: true, default: 0 })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('User', {
    eager: true,
  })
  @JoinColumn({ name: 'uploader_id', referencedColumnName: 'id' })
  uploader: Relation<User>;
}
