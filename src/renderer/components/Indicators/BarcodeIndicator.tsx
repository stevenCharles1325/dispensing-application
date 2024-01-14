import { Chip } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useBarcode from 'UI/hooks/useBarcode';

export default function BarcodeIndicator () {
  const { status, retry } = useBarcode();

  return (
    <Chip
      label="Barcode scanning"
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
      onClick={retry}
    />
  )
}
