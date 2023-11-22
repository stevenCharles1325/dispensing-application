import { Button, TextField } from '@mui/material';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Validate() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [isError, setIsError] = useState(false);

  const handleEnter = useCallback(async () => {
    const res = await window.validation.makeUserPermitted(value);

    if (res) {
      return navigate('/', { replace: true });
    }

    return setIsError(true);
  }, [navigate, value]);

  return (
    <div className="w-screen h-screen flex justify-center items-center shadow-inner">
      <div className="w-[300px] h-fit p-5 bg-white border border-fuchsia-500 rounded flex flex-col gap-5 items-center shadow-lg">
        <TextField
          required
          value={value}
          label="Master key"
          type="password"
          error={isError}
          helperText={
            isError
              ? 'Incorrect key'
              : 'Enter the key to allow you to use this application'
          }
          placeholder="Enter master key"
          onChange={(e) => setValue(e.target.value)}
          color="secondary"
          variant="outlined"
          size="small"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleEnter();
            }
          }}
        />
        <Button
          sx={{
            width: 100,
          }}
          color="secondary"
          variant="outlined"
          onClick={handleEnter}
          size="small"
        >
          Enter
        </Button>
      </div>
    </div>
  );
}
