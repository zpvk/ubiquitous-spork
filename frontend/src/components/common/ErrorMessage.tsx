import { Alert, Snackbar } from '@mui/material';
import type { AlertProps } from '@mui/material';
import { useState, useEffect } from 'react';

interface ErrorMessageProps {
  message: string | null;
  severity?: AlertProps['severity'];
  autoHideDuration?: number;
  onClose?: () => void;
}

export const ErrorMessage = ({ 
  message, 
  severity = 'error',
  autoHideDuration = 5000,
  onClose 
}: ErrorMessageProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Open snackbar when message changes and is not null/empty
    if (message) {
      setOpen(true);
    }
  }, [message]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Snackbar
      open={open && !!message}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ErrorMessage;
