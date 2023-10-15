/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, createFilterOptions } from '@mui/material';

interface CustomAutoCompleteProps {
  options: any[];
  label: string;
  value?: any;
  onChange?: (value: any) => void;
  onAdd?: (value: any) => void;
  helperText?: string;
  error?: boolean;
  sx?: Record<string, any>;
}

interface OptionType {
  inputValue?: string;
  name: string;
}

const filter = createFilterOptions<OptionType>();

export default function CustomAutoComplete({
  label,
  value: providedValue = null,
  options,
  onChange,
  onAdd,
  helperText,
  error = false,
  sx,
}: CustomAutoCompleteProps) {
  const [value, setValue] = useState<OptionType | null>(providedValue);

  useEffect(() => {
    setValue({
      name: providedValue ?? '',
    });
  }, [providedValue]);

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          onChange?.(newValue);

          setValue({
            name: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          onAdd?.(newValue.inputValue);

          // Create a new value from the user input
          setValue({
            name: newValue.inputValue,
          });
        } else {
          if (newValue) onChange?.(newValue);
          setValue(newValue);
        }
      }}
      filterOptions={(filterOptions, params) => {
        const filtered = filter(filterOptions, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = filterOptions.some(
          (option) => inputValue === option.name
        );
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            name: `Add "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.name;
      }}
      renderOption={(props, option) => <li {...props}>{option.name}</li>}
      sx={{ width: 300, ...sx }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={label}
          helperText={helperText}
          error={error}
        />
      )}
    />
  );
}
