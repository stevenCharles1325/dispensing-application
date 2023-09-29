/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton } from '@mui/material';

interface InputProps {
  type?: React.HTMLInputTypeAttribute;
  width?: number | 'full';
  height?: number | 'full';
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input(props: InputProps) {
  const {
    width = 100,
    height = 60,
    type = 'text',
    placeholder,
    onChange,
  } = props;

  const [isTextVisible, setIsTextVisible] = useState(false);
  const inputWidth = typeof width === 'string' ? 'w-full' : `w-[${width}px]`;
  const inputHeight = typeof height === 'string' ? 'h-full' : `h-[${height}px]`;

  const icon = isTextVisible ? <VisibilityOffIcon /> : <VisibilityIcon />;
  const priorityType =
    // eslint-disable-next-line no-nested-ternary
    type === 'password' ? (isTextVisible ? 'text' : 'password') : type;

  return (
    <div
      className={`${inputWidth} ${inputHeight} rounded-full bg-[#D9D9D9] overflow-hidden flex flex-row`}
    >
      <input
        placeholder={placeholder}
        className="grow outline-none bg-transparent p-3 pl-5 pr-1 shadow-md shadow-inner"
        type={priorityType}
        onChange={onChange}
      />
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
  );
}
