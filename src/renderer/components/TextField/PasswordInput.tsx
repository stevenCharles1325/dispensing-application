/* eslint-disable react/require-default-props */
import { VisibilityOff, Visibility } from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  InputProps,
} from '@mui/material';
import React, { useState } from 'react';

interface PasswordInputProps extends InputProps {
  label: string;
  error?: boolean;
  value?: string;
  helperText?: string;
  onChange: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
}

export default function PasswordInput({
  label,
  error,
  value,
  helperText,
  onChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <FormControl fullWidth color="secondary" variant="outlined">
      <InputLabel
        htmlFor="outlined-adornment-password"
        color={error ? 'error' : 'secondary'}
        sx={{
          backgroundColor: 'white',
          paddingRight: 1,
        }}
        error={error}
      >
        {label}
      </InputLabel>
      <OutlinedInput
        color="secondary"
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
        value={value}
        error={error ?? false}
        onChange={onChange}
      />
      {helperText?.length ? (
        <FormHelperText error>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}