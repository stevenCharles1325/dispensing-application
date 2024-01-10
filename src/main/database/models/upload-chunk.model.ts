/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('upload_chunks')
export class UploadChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: false })
  upload_id: string;

  @Column({ nullable: true })
  content: string;

  @CreateDateColumn()
  created_at: Date;
}
