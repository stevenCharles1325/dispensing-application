import { Button, TextField } from "@mui/material";
import React from "react";
import { useCallback, useEffect, useState } from "react";

interface ShortcutKeyFieldProps {
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
};

const specialKeys = [
  'Ctrl',
  'Alt',
  'Shift',
];

const KeyButton = ({ keyPressed }: { keyPressed: string }) => {
  return (
    <div className="min-w-[30px] w-fit h-[28px] border border-gray-500 bg-gray-200 shadow rounded border-b-4 text-center text-xs p-1">
      {keyPressed}
    </div>
  )
}

export default function ShortcutKeyField ({ error, helperText, onChange }: ShortcutKeyFieldProps) {
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

    if (combinations.length > 2) {
      combinations = [combinations[combinations.length - 1]];
    }
    onChange?.(combinations.join(','));
    setPressedKeys(combinations);
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
    <>
      <TextField
        InputProps={{
          readOnly: true,
        }}
        autoFocus
        size="small"
        color="secondary"
        type="text"
        variant="outlined"
        label="Key Combination"
        value={pressedKeys.join(' ')}
        placeholder="Enter key combination"
        error={error}
        helperText={helperText}
      />
      <div className="w-full h-fit flex justify-center">
        <div className="w-fit h-[25px] flex flex-row gap-2">
          {pressedKeys.map((keyPressed, index) => (
            <React.Fragment key={index}>
              {specialKeys.includes(keyPressed)
                ? (
                  <>
                    <KeyButton keyPressed={keyPressed} />
                    <p>+</p>
                  </>
                )
                : index === 0 && pressedKeys.length === 2
                  ? (
                    <>
                      <KeyButton keyPressed={keyPressed} />
                      <p>Chord to</p>
                    </>
                  )
                  : <KeyButton keyPressed={keyPressed} />
              }
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
