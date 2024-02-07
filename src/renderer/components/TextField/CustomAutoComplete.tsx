/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useEffect, useState } from 'react';
import { Autocomplete, TextField, createFilterOptions } from '@mui/material';

interface CustomAutoCompleteProps {
  disableAdd?: boolean;
  fullWidth?: boolean;
  options: any[];
  label: string;
  value?: any;
  variant?: 'filled' | 'outlined' | 'standard';
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: any) => void;
  onAdd?: (value: any) => void;
  helperText?: string;
  error?: boolean;
  sx?: Record<string, any>;
  inputSX?: Record<string, any>;
}

interface OptionType {
  inputValue?: string;
  name: string;
}

const filter = createFilterOptions<OptionType>();

export default function CustomAutoComplete({
  disableAdd = false,
  disabled = false,
  fullWidth = false,
  variant = 'outlined',
  label,
  value: providedValue = null,
  options,
  required,
  onChange,
  onAdd,
  helperText,
  error = false,
  sx,
  inputSX,
}: CustomAutoCompleteProps) {
  const [value, setValue] = useState<OptionType | null>(providedValue);

  useEffect(() => {
    setValue({
      name: providedValue ?? '',
    });
  }, [providedValue]);

  return (
    <Autocomplete
      fullWidth={fullWidth}
      disabled={disabled}
      options={options}
      color="secondary"
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          if (
            !options.find(({ name }) => name === newValue)
          ) {
            if (!disableAdd) {
              onAdd?.(newValue);
            }
          } else {
            onChange?.(newValue);
          }

          setValue({
            name: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          if (!disableAdd) {
            onAdd?.(newValue.inputValue);
          }

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
      renderOption={(props, option) => {
        return <li {...props}>{(option.name ?? option)}</li>;
      }}
      sx={{ width: fullWidth ? undefined : 300, ...sx }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          variant={variant}
          required={required}
          color="secondary"
          size="small"
          label={label}
          helperText={helperText}
          error={error}
          sx={inputSX}
        />
      )}
    />
  );
}
