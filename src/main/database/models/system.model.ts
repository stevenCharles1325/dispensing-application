import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('systems')
export class System {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ generated: true })
  uuid: string;

  @Column({
    nullable: true,
    default: false,
  })
  is_branch: boolean;

  @Column()
  main_branch_id: string;

  @Column()
  store_name: string;

  @Column({
    nullable: true,
    default: 0,
  })
  branch_quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
