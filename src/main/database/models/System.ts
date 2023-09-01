/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ValidationArguments,
} from 'class-validator';

const messages = {
  length: 'Length must be $constraint1',
  minLength: 'Length must be at least $constraint1',
  lengthWithMax: 'Length must be between $constraint1 to $constraint2',
  email: 'Email is invalid',
  unique: 'Already taken',
  date: 'Invalid date',
  mobileNumber: 'Invalid PH mobile number',
  password: (args: ValidationArguments) => {
    const { minLength, minNumbers, minLowercase, minUppercase, minSymbols } =
      args.constraints[0];

    return (
      `Password must be at least ${minLength} ` +
      `characters containing ${minNumbers} numbers, ` +
      `${minLowercase} lowercases, ${minUppercase} uppercases, ` +
      `and ${minSymbols} symbols`
    );
  },
};

@Entity('users')
export class User {
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
}
