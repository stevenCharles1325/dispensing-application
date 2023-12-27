export default function getElementOccurence (element: string | number, array: string[] | number[]): number {
  let count = 0;

  array.forEach((value) => {
    if (typeof value === 'string' || typeof value === 'number') {
      if (value === element) {
        count++;
      }
    } else {
      console.error('Invalid element type encountered');
    }
  });

  return count;
}
