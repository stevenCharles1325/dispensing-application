import {
  Column,
  Entity,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import bcrypt from 'bcrypt';

@Entity('systems')
export class System {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ generated: 'uuid' })
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

  @Column({ nullable: true })
  master_key: string;

  @Column({
    nullable: true,
    default: 0,
  })
  branch_quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  hashKey() {
    if (this.master_key?.length) {
      const saltRound = 10;
      const salt = bcrypt.genSaltSync(saltRound);
      this.master_key = bcrypt.hashSync(this.master_key, salt);
    }
  }
}
