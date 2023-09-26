/* eslint-disable no-prototype-builtins */
export default function parseTimeExpression(expression: string): Date {
  const timePattern = /^(\d+)([a-z]+)$/i;
  const match = expression.match(timePattern);

  if (!match) {
    throw new Error('Invalid time expression format');
  }

  const unitInMilliseconds = {
    ms: 1,
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  } as const;

  type UnitType = keyof typeof unitInMilliseconds;
  // eslint-disable-next-line radix
  const value = parseInt(match[1]);
  const unit: UnitType = match[2].toLowerCase() as UnitType;

  if (!unitInMilliseconds.hasOwnProperty(unit)) {
    throw new Error('Invalid time unit');
  }

  const expirationTime = new Date();
  expirationTime.setTime(
    expirationTime.getTime() + value * unitInMilliseconds[unit]
  );

  return expirationTime;
}
