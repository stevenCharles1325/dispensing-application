/* eslint-disable import/prefer-default-export */
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  birth_date: Date;

  @Column()
  phone_number: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  address: string;

  @Column()
  password: string;

  @Column({
    default: new Date().toString(),
  })
  created_at: Date;

  @Column({
    default: new Date().toString(),
  })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @BeforeInsert()
  hashPassword() {
    const saltRound = 10;
    const salt = bcrypt.genSaltSync(saltRound);
    this.password = bcrypt.hashSync(this.password, salt);
  }
}
