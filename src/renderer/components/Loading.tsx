import { CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <div className="w-full h-full bg-transparent">
      <CircularProgress color="secondary" />
    </div>
  );
}
