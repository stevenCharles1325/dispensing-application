import { useCallback, useEffect, useState } from "react";

interface ShortcutKeyFieldProps {
  onChange: (value: string) => void;
};

const specialKeys = [
  'Ctrl',
  'Alt',
  'Shift',
];

export default function ShortcutKeyField ({ onChange }: ShortcutKeyFieldProps) {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const key = event.key.toLocaleUpperCase();
    const ctrlKey = event.ctrlKey;
    const altKey = event.altKey;
    const shiftKey = event.shiftKey;
    const metaKey = event.metaKey;

    let combinations = [...pressedKeys];

    if (key === 'CONTROL' && !combinations.includes('Ctrl')) {
      combinations.push('Ctrl');
    } else if (key === 'ALT' && !combinations.includes('Alt')) {
      combinations.push('Alt');
    } else if (key === 'SHIFT' && !combinations.includes('Shift')) {
      combinations.push('Shift');
    } else if (key === 'META' && !combinations.includes('Meta')) {
      combinations.push('Meta');
    } else {
      combinations = combinations.filter((combination) =>
        !specialKeys.includes(combination)
      );
    }

    let combination = '';
    if (ctrlKey && key !== 'CONTROL') {
      combination += `Ctrl + `;
    }

    if (altKey && key !== 'ALT') {
      combination += `Alt + `;
    }

    if (shiftKey && key !== 'SHIFT') {
      combination += `Shift + `;
    }

    if (metaKey && key !== 'META') {
      combination += `Meta + `;
    }

    if (
      (!ctrlKey && key !== 'CONTROL') &&
      (!shiftKey && key !== 'SHIFT') &&
      (!altKey && key !== 'ALT') &&
      (!metaKey && key !== 'META')
    ) {
      combinations.push(key);
    } else if ((
      ctrlKey ||
      shiftKey ||
      altKey ||
      metaKey
    ) && (
      key !== 'CONTROL' &&
      key !== 'SHIFT' &&
      key !== 'ALT' &&
      key !== 'META'
    )) {
      combinations.push(`${combination}${key}`);
    }

    onChange?.(combinations.slice(-2).join(','));
    setPressedKeys(combinations.slice(-2));
    return false;
  }, [pressedKeys]);

  useEffect(() => {
    // Attach event listeners when the component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Detach event listeners when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pressedKeys]); // Dependency array includes pressedKeys

  return (
    <input
      readOnly
      autoFocus
      type="text"
      className="w-full h-[35px] border hover:border-fuchsia-500/70 focus:border-fuchsia-500 rounded px-5 outline-none"
      value={pressedKeys.join(' ')}
      placeholder="Enter key combination"
    />
  );
}
