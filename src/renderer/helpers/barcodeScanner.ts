type HookType = (barcode: string | null) => void;

export default function barcodeReader() {
  let barcode = '';
  let interval: NodeJS.Timeout;

  const handler =
    (hook: HookType) =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (interval) clearInterval(interval);

    if (event.code === 'Enter') {
      if (barcode) {
        hook(barcode);
      }

      barcode = '';
      return;
    }

    if (event.key !== 'Shift') {
      barcode += event.key;
    }

    interval = setInterval(() => barcode = '', 20);
  }

  return handler;
}
