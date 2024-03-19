const measurementSymbols: Record<string, string> = {
  // Length/Dimension
  'millimeters': 'mm',
  'centimeters': 'cm',
  'meters': 'm',
  'feet': 'ft',
  'yards': 'yd',

  // Weight/Mass
  'milligrams': 'mg',
  'grams': 'g',
  'kilograms': 'kg',
  'ounces': 'oz',
  'pounds': 'lb',

  // Volume/Capacity
  'milliliters': 'ml',
  'liters': 'l',
  'cubic-centimeters': 'cm³',
  'cubic-meters': 'm³',
  'fluid-ounces': 'fl oz',
  'gallons': 'gal',

  // Area
  'square-millimeters': 'mm²',
  'square-centimeters': 'cm²',
  'square-meters': 'm²',
  'square-inches': 'in²',
  'square-feet': 'ft²',
  'square-yards': 'yd²',

  // Count/Quantity
  'each': 'ea',
  'dozen': 'dz',
  'gross': 'gr',
  'pack': 'pk',
  'pair': 'pr',
  'pieces': 'pcs',
  'set': 'set',
};

export default function getUOFSymbol(name: string, longName: boolean = false) {
  name = name.toLocaleLowerCase();
  const measurementsReversed: Record<string, any> = {};

  // Reversing key as the new value and so on
  for (const key in Object.keys(measurementSymbols)) {
    const value = measurementSymbols[key];
    measurementsReversed[value] = key;
  }

  if (longName) {
    if (measurementSymbols[name]) return name;

    return measurementsReversed[name] ?? null;
  }

  return {
    ...measurementSymbols,
    ...measurementsReversed
  }[name] ?? null;
}
