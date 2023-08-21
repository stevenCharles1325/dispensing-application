/* eslint-disable import/prefer-default-export */
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import bcrypt from 'bcrypt';
import {
  IsMobilePhone,
  Length,
  IsEmail,
  IsDate,
  MinLength,
  IsStrongPassword,
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
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @Length(3, 20, {
    message: messages.lengthWithMax,
  })
  first_name: string;

  @Column()
  @Length(3, 20, {
    message: messages.lengthWithMax,
  })
  last_name: string;

  @Column()
  @IsDate({
    message: messages.date,
  })
  birth_date: Date;

  @Column()
  @Length(13, undefined, {
    message: messages.length,
  }) // 13 characters including "+" sign.
  @IsMobilePhone(
    'en-PH',
    {
      strictMode: true,
    },
    {
      message: messages.mobileNumber,
    }
  )
  phone_number: string;

  @Column({
    unique: true,
  })
  @IsEmail(undefined, {
    message: messages.email,
  })
  email: string;

  @Column()
  @MinLength(10, {
    message: messages.minLength,
  })
  address: string;

  @Column()
  @IsStrongPassword(
    {
      minLength: 12,
      minNumbers: 3,
      minLowercase: 3,
      minUppercase: 3,
      minSymbols: 3,
    },
    {
      message: messages.password,
    }
  )
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

  merge(payload: any) {
    type UserKeys = keyof this;

    const keys = Object.keys(payload) as UserKeys[];
    keys.forEach((key) => {
      if (this[key] !== undefined) {
        this[key] = payload[key];
      } else {
        throw new Error(
          `Trying to set unknown User class property ${key as string}`
        );
      }
    });
  }
}
