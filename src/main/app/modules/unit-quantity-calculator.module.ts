import { IItemMeasurement } from 'App/interfaces/item/item.measurements.interface';
import unit from 'unitmath';

interface IUnitQuantity {
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
];

export default function unitQuantityCalculator (
  item: IUnitQuantity,
  other: IUnitQuantity,
  unitFormatter: (data: string, longName?: boolean) => string,
  operation: 'add' | 'sub' = 'add',
): [number, string] {
  if (
    !item ||
    !other ||
    !AVAILABLE_OPERATIONS.includes(operation)
  ) throw new Error('Unit Calculator Error: Invalid argument');

  if (
    NORMAL_UNITS.includes(item.unit.toLocaleLowerCase()) ||
    NORMAL_UNITS.includes(other.unit.toLocaleLowerCase())
    ) {
    return [
      (Number(item.quantity) - Number(other.quantity)) ?? 0,
      unitFormatter(item.unit, true),
    ];
  }

  const itemQuantity = `${item.quantity} ${unitFormatter(item.unit)}`;
  const otherQuantity = `${other.quantity} ${unitFormatter(other.unit)}`;

  const result = unit(itemQuantity)
    [operation](otherQuantity)
    .toString({ precision: 4 });

  const [quantity, um] = result.split(' ');

  return [
    Number(quantity) ?? 0,
    unitFormatter(um, true)
  ]
}
