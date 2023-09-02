import {
  Column,
  Entity,
  AfterInsert,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('systems')
export class System {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @AfterInsert()
  checkMainBranch() {
    if (!this.is_branch) {
      this.main_branch_id = this.id;
    }
  }
}
