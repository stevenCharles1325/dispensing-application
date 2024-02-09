import { IItemMeasurement } from 'App/interfaces/item/item.measurements.interface';
import unit from 'unitmath';

export interface IUnitCalculatorOperands {
  quantity: number;
  unit: IItemMeasurement | string;
}

const AVAILABLE_OPERATIONS = [
  'add',
  'sub'
];

const NORMAL_UNITS = [
  'each',
  'gross',
  'pack',
  'dozen',
  'pair',
  'pieces',
  'piece',
];

export default function unitQuantityCalculator (
  leftOperand: IUnitCalculatorOperands,
  rightOperand: IUnitCalculatorOperands,
  unitFormatter: (data: string, longName?: boolean) => string,
  operation: 'add' | 'sub' = 'add',
): [number, string] {
  if (
    !leftOperand ||
    !rightOperand ||
    !AVAILABLE_OPERATIONS.includes(operation)
  ) throw new Error('Unit Calculator Error: Invalid argument');

  if (
    NORMAL_UNITS.includes(leftOperand.unit.toLocaleLowerCase()) ||
    NORMAL_UNITS.includes(rightOperand.unit.toLocaleLowerCase())
    ) {
    return [
      (Number(leftOperand.quantity) - Number(rightOperand.quantity)) ?? 0,
      unitFormatter(leftOperand.unit, true),
    ];
  }

  const itemQuantity = `${leftOperand.quantity} ${unitFormatter(leftOperand.unit)}`;
  const otherQuantity = `${rightOperand.quantity} ${unitFormatter(rightOperand.unit)}`;

  const result = unit(itemQuantity)
    [operation](otherQuantity)
    .toString({ precision: 4 });

  const [quantity, um] = result.split(' ');

  return [
    Number(quantity) ?? 0,
    unitFormatter(um, true)
  ]
}
