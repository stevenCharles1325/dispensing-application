/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  ManyToOne,
  Relation,
  AfterLoad,
  JoinColumn,
  BeforeInsert,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Upload } from './upload.model';

@Entity('upload_datas')
export class UploadData {
  @AfterLoad()
  async getUpload() {
    const UploadRepository = global.datasource.getRepository('uploads');
    const upload = await UploadRepository.findOneByOrFail({ id: this.upload_id });

    this.upload = upload as Upload;
  }

  @BeforeInsert()
  async updateUploadStateCounts () {
    const UploadRepository = global.datasource.getRepository('uploads');
    const upload = await UploadRepository.findOneByOrFail({
      id: this.upload_id
    }) as Upload;

    if (this.status === 'error') {
      upload.error_count += 1;
    } else {
      upload.success_count += 1;
    }

    await UploadRepository.save(upload);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  upload_id: string;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: true, default: 'success' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne('Upload', {
    eager: true,
  })
  @JoinColumn({ name: 'upload_id', referencedColumnName: 'id' })
  upload: Relation<Upload>;
}
