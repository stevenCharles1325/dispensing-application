/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton } from '@mui/material';

interface InputProps {
  value?: any;
  name?: string;
  label?: string;
  type?: React.HTMLInputTypeAttribute;
  width?: number | 'full';
  height?: number | 'full';
  placeholder?: string;
  opacity?: number | 'clear' | 'normal';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input(props: InputProps) {
  const {
    width = 100,
    height = 60,
    type = 'text',
    value = null,
    opacity = 'normal',
    leftIcon = null,
    rightIcon = null,
    placeholder,
    name,
    label,
    onChange,
  } = props;

  const [isTextVisible, setIsTextVisible] = useState(false);
  const inputWidth = typeof width === 'string' ? 'w-full' : `w-[${width}px]`;
  const inputHeight = typeof height === 'string' ? 'h-full' : `h-[${height}px]`;

  const icon = isTextVisible ? <VisibilityOffIcon /> : <VisibilityIcon />;
  const priorityType =
    // eslint-disable-next-line no-nested-ternary
    type === 'password' ? (isTextVisible ? 'text' : 'password') : type;

  const bgColor =
    typeof opacity === 'string'
      ? opacity === 'clear'
        ? 'rgba(217, 217, 217, 0)'
        : 'rgba(217, 217, 217, 1)'
      : `rgba(217, 217, 217, ${opacity})`;

  return (
    <>
      {label ? (
        <label
          htmlFor={name}
          className="px-5"
          style={{ color: 'var(--info-text-color)' }}
        >
          {label}
        </label>
      ) : null}
      <div
        className={`${inputWidth} ${inputHeight} px-1 rounded-full overflow-hidden flex flex-row justify-center`}
        style={{ backgroundColor: bgColor }}
      >
        {leftIcon ? (
          <div className="grow flex justify-center items-center">
            {leftIcon}
          </div>
        ) : null}
        <input
          value={value}
          placeholder={placeholder}
          className={`grow-[2] outline-none bg-transparent p-3 pr-1 ${
            !leftIcon ? 'pl-5' : 'pl-0'
          }`}
          type={priorityType}
          name={name}
          onChange={onChange}
        />
        {rightIcon ? (
          <div className="grow flex justify-center items-center">
            {rightIcon}
          </div>
        ) : null}
        {type === 'password' ? (
          <div className="grow-0 w-14 flex justify-center items-center">
            <IconButton
              onClick={() =>
                setIsTextVisible((textVisibility) => !textVisibility)
              }
            >
              {icon}
            </IconButton>
          </div>
        ) : null}
      </div>
    </>
  );
}
