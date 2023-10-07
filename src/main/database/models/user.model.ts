/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
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
} from 'class-validator';
import { Role } from './role.model';
import { PermissionsKebabType } from 'Main/data/defaults/permissions';
import RoleRepository from 'App/repositories/role.repository';
import SystemRepository from 'App/repositories/system.repository';
import { ValidationMessage } from './validator/message';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    nullable: true,
  })
  lead_id: number;

  @Column()
  system_id: string;

  @Column()
  role_id: number;

  @Column()
  @Length(3, 20, {
    message: ValidationMessage.maxLength,
  })
  first_name: string;

  @Column()
  @Length(3, 20, {
    message: ValidationMessage.maxLength,
  })
  last_name: string;

  @Column()
  @IsDate({
    message: ValidationMessage.date,
  })
  birth_date: Date;

  @Column()
  @Length(13, undefined, {
    message: ValidationMessage.length,
  }) // 13 characters including "+" sign.
  @IsMobilePhone(
    'en-PH',
    {
      strictMode: true,
    },
    {
      message: ValidationMessage.mobileNumber,
    }
  )
  phone_number: string;

  @Column({ unique: true })
  @IsEmail(undefined, {
    message: ValidationMessage.email,
  })
  email: string;

  @Column()
  @MinLength(10, {
    message: ValidationMessage.minLength,
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
      message: ValidationMessage.password,
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

  @OneToMany(() => User, (user: User) => user.lead)
  @JoinColumn({ name: 'lead_id', referencedColumnName: 'id' })
  subordinates: User[];

  @ManyToOne(() => User, (user: User) => user.subordinates)
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
