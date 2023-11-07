/* eslint-disable prefer-destructuring */
/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
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
import { PermissionsKebabType } from 'Main/data/defaults/permissions';
import { ValidationMessage } from '../../app/validators/message/message';
import type { Role } from './role.model';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    nullable: true,
  })
  lead_id: number;

  @Column()
  system_id: number;

  @Column()
  role_id: number;

  @Column({ nullable: true })
  image_url: string;

  @Column({
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value,
    },
  })
  @Length(3, 20, {
    message: ValidationMessage.maxLength,
  })
  first_name: string;

  @Column({
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value,
    },
  })
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

  @OneToOne('Role', { eager: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Relation<Role>;

  @OneToMany('User', (user: User) => user.lead)
  @JoinColumn({ name: 'lead_id', referencedColumnName: 'id' })
  subordinates: Relation<User>[];

  @ManyToOne('User', (user: User) => user.subordinates)
  @JoinColumn({ name: 'lead_id', referencedColumnName: 'id' })
  lead: Relation<User>;

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
      const RoleRepository = global.datasource.getRepository('roles');
      const cashierRole = await RoleRepository.findOneByOrFail({
        kebab: 'cashier',
      });

      this.role_id = cashierRole.id;
    }
  }

  @BeforeInsert()
  async setSystemId() {
    if (!this.system_id) {
      const SystemRepository = global.datasource.getRepository('systems');
      const thisSystem = await SystemRepository.createQueryBuilder()
        .where('uuid = main_branch_id')
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
