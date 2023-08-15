import bcrypt from 'bcrypt';
import {
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  Model,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Unique,
  BeforeCreate,
} from 'sequelize-typescript';

@Table({
  timestamps: true,
})
class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  employee_id: string;

  @Column
  first_name: string;

  @Column
  last_name: string;

  @Column
  phone_number: string;

  @Column
  @Unique
  email: string;

  @Column
  address: string;

  @Column
  gender: 'male' | 'female';

  @Column
  password: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @BeforeCreate
  static hasPassword(user: User) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);

    user.password = bcrypt.hashSync(user.password, salt);
  }
}

export default User;
