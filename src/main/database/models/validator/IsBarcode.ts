import { registerDecorator, ValidationOptions } from 'class-validator';

const validBarcode = require('barcode-validator');

export function IsBarcode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsBarcode',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(barcode: any) {
          return validBarcode(barcode);
        },
      },
    });
  };
}
