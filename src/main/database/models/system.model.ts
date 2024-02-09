import {
  Column,
  Entity,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  Length,
  IsMobilePhone,
  IsNotEmpty,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import bcrypt from 'bcrypt';
import { ValidationMessage } from 'App/validators/message/message';
import SystemDTO from 'App/data-transfer-objects/system.dto';

@Entity('systems')
export class System {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    default: false,
  })
  is_main: boolean;

  @Column()
  @ValidateIf((system: SystemDTO) => system.is_main === false)
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  main_branch_id: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  store_name: string;

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

  @Column()
  @IsEmail(undefined, {
    message: ValidationMessage.email,
  })
  email: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  master_key: string;

  @Column({ nullable: true })
  api_url: string;

  @Column({ nullable: true })
  auto_sync: boolean;

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
