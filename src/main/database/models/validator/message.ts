import { ValidationArguments } from 'class-validator';

const message = {
  length: 'Length must be $constraint1',
  minLength: 'Length must be at least $constraint1',
  maxLength: 'Length must be between $constraint1 to $constraint2',
  negative: 'Value must be greater than or equal to zero',
  email: 'Email is invalid',
  unique: 'Already taken',
  date: 'Date is invalid',
  mobileNumber: 'PH mobile number is invalid',
  measurements: 'Item measurement must be any of the following: $constraint1',
  status: 'Status must be in $constraint1',
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

export { message as ValidationMessage };
