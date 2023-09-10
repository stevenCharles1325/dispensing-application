/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Exclusion,
  OneToOne,
  OneToMany,
  ManyToOne,
  AfterLoad,
  JoinColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
import { Role } from './Role';
import RoleRepository from 'Main/app/repositories/Role-repository';
import { PermissionsKebabType } from 'Main/data/defaults/permissions';
import SystemRepository from 'Main/app/repositories/System-repository';

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

  @Column({
    nullable: true,
  })
  lead_id: number;

  @Column({
    nullable: true,
  })
  system_id: string;

  @Column()
  role_id: number;

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

  @Column({ unique: true })
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;

  @OneToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;

  @OneToMany(() => User, (user) => user.lead)
  @JoinColumn({ name: 'lead_id', referencedColumnName: 'id' })
  subordinates: User[];

  @ManyToOne(() => User, (user) => user.subordinates)
  @JoinColumn({ name: 'lead_id', referencedColumnName: 'id' })
  lead: User;

  @AfterLoad()
  fullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  @AfterLoad()
  hasPermission(...permission: PermissionsKebabType[]) {
    return this.role?.permissions?.some(({ kebab }) =>
      permission.includes(kebab as PermissionsKebabType)
    );
  }

  @BeforeInsert()
  hashPassword() {
    const saltRound = 10;
    const salt = bcrypt.genSaltSync(saltRound);
    this.password = bcrypt.hashSync(this.password, salt);
  }

  @BeforeInsert()
  async assignBasicRole() {
    if (!this.role_id) {
      const cashierRole = await RoleRepository.findOneByOrFail({
        kebab: 'cashier',
      });

      this.role_id = cashierRole.id;
    }
  }

  @BeforeInsert()
  async setSystemId() {
    if (!this.system_id) {
      const thisSystem = await SystemRepository.createQueryBuilder()
        .where('id = main_branch_id')
        .getOne();

      if (thisSystem) {
        this.system_id = thisSystem.id;
      }
    }
  }

  serialize(...except: string[]) {
    const serialized: Record<string, any> = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(this)) {
      // eslint-disable-next-line no-continue
      if (typeof value === 'function') continue;

      // eslint-disable-next-line no-continue
      if (except.includes(key)) continue;

      serialized[key] = value;
    }

    return serialized;
  }
}
