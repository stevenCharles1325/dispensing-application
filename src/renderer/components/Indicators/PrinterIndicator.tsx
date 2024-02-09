import { Chip } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import usePrinter from 'UI/hooks/usePrinter';

export default function PrinterIndicator () {
  const { status } = usePrinter();

  return (
    <Chip
      label="Printer"
      color={
        status === 'SUCCESS'
        ? 'success'
        : status === 'ERROR'
          ? 'error'
          : status === 'WAIT'
            ? 'secondary'
            : undefined
      }
      variant="outlined"
      icon={
        status === 'SUCCESS'
        ? <CheckCircleOutlineIcon fontSize='small' />
        : status === 'ERROR'
          ? <ErrorOutlineIcon fontSize='small' />
          : status === 'WAIT'
            ? <CircularProgress size={20} />
            : undefined
      }
    />
  )
}
