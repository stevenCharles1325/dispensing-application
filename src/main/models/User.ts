/* eslint-disable import/prefer-default-export */
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import bcrypt from 'bcrypt';
import { IsMobilePhone, Length, IsEmail, IsDate, Min } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(3, 20)
  first_name: string;

  @Column()
  @Length(3, 20)
  last_name: string;

  @Column()
  @IsDate()
  birth_date: Date;

  @Column()
  @IsMobilePhone('en-PH')
  phone_number: string;

  @Column({
    unique: true,
  })
  @IsEmail()
  email: string;

  @Column()
  @Min(10)
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
