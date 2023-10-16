import { CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <div className="w-full h-full bg-transparent flex justify-center items-center">
      <CircularProgress color="secondary" />
    </div>
  );
}
