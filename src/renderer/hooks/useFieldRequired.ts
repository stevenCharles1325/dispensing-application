/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
export default function useFieldRequired(
  fields: Record<string, any>,
  except: string[]
): [Boolean, Array<string>] {
  const noValueFields = [];

  if (!fields) {
    return [false, []];
  }

  for (const field of Object.keys(fields)) {
    if (except.includes(field)) continue;

    if (fields[field] === null || fields[field] === undefined) {
      noValueFields.push(field);
      continue;
    }

    if (typeof fields[field] === 'string' && fields[field].length === 0) {
      noValueFields.push(field);
      continue;
    }

    if (typeof fields[field] === 'number' && fields[field] <= 0) {
      noValueFields.push(field);
      continue;
    }

    if (Array.isArray(fields[field]) && !fields[field].length) {
      noValueFields.push(field);
      continue;
    }
  }

  return [Boolean(!noValueFields.length), noValueFields];
}
